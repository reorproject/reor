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
  // private openai!: OpenAI;
  // public modelName!: string;
  // private messageHistory!: ChatbotMessage[];
  private abortStreaming: boolean = false;
  private tokenEncoding!: Tiktoken;
  private modelConfig!: OpenAILLMConfig;

  // async init(modelName: string, modelConfig: OpenAILLMConfig) {
  //   // this.openai = new OpenAI({
  //   //   apiKey: modelConfig.apiKey,
  //   //   baseURL: modelConfig.apiURL,
  //   //   fetch: customFetchUsingElectronNetStreaming,
  //   // });
  //   // this.modelConfig = modelConfig;
  //   // this.modelName = modelName;
  //   try {
  //     this.tokenEncoding = encodingForModel(modelName as TiktokenModel);
  //   } catch (e) {
  //     this.tokenEncoding = encodingForModel("gpt-3.5-turbo-1106"); // hack while we think about what to do with custom remote models' tokenizers
  //   }
  // }

  private isModelLoaded(): boolean {
    // For API-based models, this can always return true as there's no "loading" process
    return true;
  }

  // async runToolUseConversation() {
  //   // Step 1: send the conversation and available functions to the model
  //   const messages: Array<ChatCompletionMessageParam> = [
  //     {
  //       role: "user",
  //       content: "What's the weather like in San Fran?",
  //     },
  //   ];
  //   const tools: Array<ChatCompletionTool> = [
  //     {
  //       type: "function",
  //       function: {
  //         name: "get_current_weather",
  //         description: "Get the current weather in a given location",
  //         parameters: {
  //           type: "object",
  //           properties: {
  //             location: {
  //               type: "string",
  //               description: "The city and state, e.g. San Francisco, CA",
  //             },
  //             unit: { type: "string", enum: ["celsius", "fahrenheit"] },
  //           },
  //           required: ["location"],
  //         },
  //       },
  //     },
  //   ];

  //   const response = await this.openai.chat.completions.create({
  //     model: this.modelName,
  //     messages: messages,
  //     tools: tools,
  //     tool_choice: "auto", // auto is default, but we'll be explicit
  //   });
  //   const responseMessage = response.choices[0].message;
  //   console.log("responseMessage:", responseMessage);
  //   // Step 2: check if the model wanted to call a function
  //   const toolCalls = responseMessage.tool_calls;
  //   console.log("toolCalls:", toolCalls);
  //   if (responseMessage.tool_calls) {
  //     // Step 3: call the function
  //     // Note: the JSON response may not always be valid; be sure to handle errors
  //     const availableFunctions = {
  //       get_current_weather: getCurrentWeather,
  //     }; // only one function in this example, but you can have multiple
  //     messages.push(responseMessage); // extend conversation with assistant's reply
  //     if (!toolCalls) {
  //       throw new Error("tool_calls not found in response");
  //     }
  //     for (const toolCall of toolCalls) {
  //       // const functionName = toolCall.function.name;
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const functionToCall = availableFunctions[
  //         toolCall.function.name
  //       ] as any;
  //       const functionArgs = JSON.parse(toolCall.function.arguments);
  //       const functionResponse = functionToCall(
  //         functionArgs.location,
  //         functionArgs.unit
  //       );
  //       messages.push({
  //         tool_call_id: toolCall.id,
  //         role: "tool",
  //         // name: functionName,
  //         content: functionResponse,
  //       }); // extend conversation with function response
  //     }
  //     console.log("MESSAGES BEFORE SECOND RESPONSE:", messages);
  //     const secondResponse = await this.openai.chat.completions.create({
  //       model: "gpt-3.5-turbo-0125",
  //       messages: messages,
  //     }); // get a new response from the model where it can see the function response
  //     return secondResponse.choices;
  //   }
  // }

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
    this.abortStreaming = true;
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

    try {
      const stream = await openai.chat.completions.create({
        model: modelName,
        messages: messageHistory,
        stream: true,
        max_tokens: generationParams?.maxTokens,
        temperature: generationParams?.temperature,
      });

      for await (const chunk of stream) {
        if (this.abortStreaming) {
          break; // Exit the loop if the flag is set
        }
        handleChunk(chunk);
      }

      // return result;
    } catch (error) {
      console.error("Error during OpenAI streaming session:", error);
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
