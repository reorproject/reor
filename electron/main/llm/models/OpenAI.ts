import OpenAI from "openai";
import {
  ChatbotMessage,
  ISendFunctionImplementer,
  IChatSessionService,
  OpenAIMessage,
} from "../Types";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import { OpenAILLMConfig } from "electron/main/Store/storeConfig";
import { net } from "electron";
import { ClientRequestConstructorOptions } from "electron/main";

export class OpenAIModelSessionService implements IChatSessionService {
  private openai!: OpenAI;
  public modelName!: string;
  private messageHistory!: ChatbotMessage[];
  private abortStreaming: boolean = false;
  private tokenEncoding!: Tiktoken;
  private modelConfig!: OpenAILLMConfig;

  async init(modelName: string, modelConfig: OpenAILLMConfig) {
    this.openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    });
    this.modelConfig = modelConfig;
    this.modelName = modelName;
    this.messageHistory = [];
    try {
      this.tokenEncoding = encodingForModel(modelName as TiktokenModel);
    } catch (e) {
      this.tokenEncoding = encodingForModel("gpt-3.5-turbo-1106"); // hack while we think about what to do with custom remote models' tokenizers
    }
  }

  private isModelLoaded(): boolean {
    // For API-based models, this can always return true as there's no "loading" process
    return true;
  }

  public tokenize = (text: string): number[] => {
    return this.tokenEncoding.encode(text);
  };

  public getContextLength(): number {
    return this.modelConfig.contextLength || 0;
  }

  public abort(): void {
    this.abortStreaming = true;
  }

  async streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer,
    ignoreChatHistory?: boolean
  ): Promise<string> {
    if (!this.isModelLoaded()) {
      throw new Error("Model not initialized");
    }
    this.abortStreaming = false;

    if (ignoreChatHistory) {
      this.messageHistory = [];
    }

    // Add the user's prompt to the message history
    this.messageHistory.push({
      role: "user",
      content: prompt,
      messageType: "success",
    });

    try {
      const openAIMessages = this.messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })) as OpenAIMessage[];

      const stream = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: openAIMessages,
        stream: true,
      });

      let result = "";
      for await (const chunk of stream) {
        if (this.abortStreaming) {
          break; // Exit the loop if the flag is set
        }
        const content = chunk.choices[0]?.delta?.content || "";
        result += content;

        // Update the message history with the response
        this.messageHistory.push({
          role: "assistant",
          content,
          messageType: "success",
        });

        sendFunctionImplementer.send("tokenStream", {
          messageType: "success",
          content,
        });
      }

      return result;
    } catch (error) {
      console.error("Error during OpenAI streaming session:", error);
      sendFunctionImplementer.send("tokenStream", {
        messageType: "error",
        content: "Error during OpenAI streaming session: " + error + "\n",
      });
      return "error";
    }
  }
}
import { Readable } from "stream";

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
