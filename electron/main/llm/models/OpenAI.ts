import OpenAI from "openai";
import { LLMSessionService } from "../Types";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import {
  LLMGenerationParameters,
  OpenAILLMConfig,
} from "electron/main/Store/storeConfig";
import { net } from "electron";
import { ClientRequestConstructorOptions } from "electron/main";
import { Readable } from "stream";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

export class OpenAIModelSessionService implements LLMSessionService {
  public getTokenizer = (llmName: string): ((text: string) => number[]) => {
    let tokenEncoding: Tiktoken;
    try {
      tokenEncoding = encodingForModel(llmName as TiktokenModel);
    } catch (e) {
      tokenEncoding = encodingForModel("gpt-3.5-turbo-1106"); // hack while we think about what to do with custom remote models' tokenizers
    }
    const tokenize = (text: string): number[] => {
      return tokenEncoding.encode(text);
    };
    return tokenize;
  };

  public abort(): void {
    throw new Error("Abort not yet implemented.");
  }

  async streamingResponse(
    modelName: string,
    modelConfig: OpenAILLMConfig,
    messageHistory: ChatCompletionMessageParam[],
    handleChunk: (chunk: ChatCompletionChunk) => void,
    generationParams?: LLMGenerationParameters
  ): Promise<void> {
    const openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    });
    // const tokenEncoding = this.getTokenizer(modelName);

    const stream = await openai.chat.completions.create({
      model: modelName,
      messages: messageHistory,
      stream: true,
      max_tokens: generationParams?.maxTokens,
      temperature: generationParams?.temperature,
    });

    for await (const chunk of stream) {
      handleChunk(chunk);
    }
  }
}

export const customFetchUsingElectronNetStreaming = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = input instanceof URL ? input.href : input.toString();
  const options = init || {};

  return new Promise((resolve, reject) => {
    const requestOptions: ClientRequestConstructorOptions = {
      method: options.method || "GET",
      url: url,
    };

    // Ignore the 'agent' property from 'init' as it's not relevant for Electron's net module
    if ("agent" in options) {
      delete options.agent;
    }

    const request = net.request(requestOptions);

    // Set headers, except for 'content-length' which will be set automatically
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== "content-length") {
          // Skip 'content-length'
          request.setHeader(key, value as string);
        }
      });
    }

    // Handle request body
    if (options.body) {
      let bodyData;
      if (options.body instanceof ArrayBuffer) {
        bodyData = Buffer.from(options.body);
      } else if (
        typeof options.body === "string" ||
        Buffer.isBuffer(options.body)
      ) {
        bodyData = options.body;
      } else if (typeof options.body === "object") {
        bodyData = JSON.stringify(options.body);
        request.setHeader("Content-Type", "application/json");
      } else {
        reject(new Error("Unsupported body type"));
        return;
      }
      request.write(bodyData);
    }

    request.on("response", (response) => {
      const nodeStream = new Readable({
        read() {},
      });

      response.on("data", (chunk) => {
        nodeStream.push(chunk);
      });

      response.on("end", () => {
        nodeStream.push(null); // Signal end of stream
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.on("error", (error: any) => {
        nodeStream.destroy(error); // Handle stream errors
      });

      const webStream = nodeToWebStream(nodeStream);

      resolve(
        new Response(webStream, {
          status: response.statusCode,
          statusText: response.statusMessage,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          headers: new Headers(response.headers as any),
        })
      );
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
};

function nodeToWebStream(nodeStream: Readable): ReadableStream<Uint8Array> {
  let isStreamEnded = false;

  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        if (!isStreamEnded) {
          controller.enqueue(
            chunk instanceof Buffer ? new Uint8Array(chunk) : chunk
          );
        }
      });

      nodeStream.on("end", () => {
        if (!isStreamEnded) {
          isStreamEnded = true;
          controller.close();
        }
      });

      nodeStream.on("error", (err) => {
        if (!isStreamEnded) {
          isStreamEnded = true;
          controller.error(err);
        }
      });
    },
    cancel(reason) {
      // Handle any cleanup or abort logic here
      nodeStream.destroy(reason);
    },
  });

  return webStream;
}
