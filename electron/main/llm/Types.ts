import {
  BaseLLMConfig,
  HardwareConfig,
  LLMGenerationParameters,
} from "../Store/storeConfig";

// Any LLM engine should implement this interface:
export interface LLMSessionService {
  /**
   * Initializes the session.
   * @returns A promise that resolves when the initialization is complete.
   */
  init(
    modelName: string,
    modelConfig: BaseLLMConfig,
    hardwareConfig: HardwareConfig
  ): Promise<void>;
  /**
   * Handles the streaming of prompts.
   * @param prompt The prompt to be streamed.
   * @param sendFunctionImplementer The implementer of the send function.
   * @returns A promise that resolves to a string response.
   */
  streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer,
    generationParams?: LLMGenerationParameters,
    ignoreChatHistory?: boolean
  ): Promise<string>;

  abort(): void;
  getContextLength(): number;
  tokenize(text: string): number[];
}

export interface ISendFunctionImplementer {
  /**
   * Sends a message to the specified channel with optional arguments.
   * @param channel The channel to send the message to.
   * @param args Additional arguments for the message.
   */
  send(channel: string, ...args: unknown[]): void;
}

export type MessageRole = "user" | "assistant";

export type OpenAIMessage = {
  role: MessageRole;
  content: string;
};

// Extend OpenAIMessage to create ChatbotMessage, adding messageType property
export type ChatbotMessage = OpenAIMessage & {
  messageType: "success" | "error" | "COMPLETED";
};
