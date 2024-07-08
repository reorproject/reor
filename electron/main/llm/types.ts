import { MessageStreamEvent } from "@anthropic-ai/sdk/resources";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

import {
  LLMGenerationParameters,
  LLMConfig,
} from "../electron-store/storeConfig";

// Any LLM engine should implement this interface:
export interface LLMSessionService {
  /**
   * Initializes the session.
   * @returns A promise that resolves when the initialization is complete.
   */
  // init(
  //   modelName: string,
  //   modelConfig: BaseLLMConfig,
  //   hardwareConfig: HardwareConfig
  // ): Promise<void>;
  /**
   * Handles the streaming of prompts.
   * @param prompt The prompt to be streamed.
   * @param sendFunctionImplementer The implementer of the send function.
   * @returns A promise that resolves to a string response.
   */
  streamingResponse(
    modelName: string,
    modelConfig: LLMConfig,
    isJSONMode: boolean,
    messageHistory: Array<ChatCompletionMessageParam>,
    chunkResponse: (chunk: ChatCompletionChunk | MessageStreamEvent) => void,
    generationParams?: LLMGenerationParameters
  ): Promise<void>;

  getTokenizer: (llmName: string) => (text: string) => number[];
  abort(): void;
}

export interface ISendFunctionImplementer {
  /**
   * Sends a message to the specified channel with optional arguments.
   * @param channel The channel to send the message to.
   * @param args Additional arguments for the message.
   */
  send(channel: string, ...args: unknown[]): void;
}
