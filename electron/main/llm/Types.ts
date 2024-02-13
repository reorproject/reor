export interface ISessionService {
  /**
   * Initializes the session.
   * @returns A promise that resolves when the initialization is complete.
   */
  // init(): Promise<void>;

  /**
   * Handles the streaming of prompts.
   * @param prompt The prompt to be streamed.
   * @param sendFunctionImplementer The implementer of the send function.
   * @returns A promise that resolves to a string response.
   */
  streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer,
    ignoreChatHistory?: boolean
  ): Promise<string>;

  /**
   * Aborts the response.
   */
  abort(): void;
  getContextLength(): number;
  tokenize(text: string): number[];
}

/**
 * Interface for objects capable of sending messages.
 */
export interface ISendFunctionImplementer {
  /**
   * Sends a message to the specified channel with optional arguments.
   * @param channel The channel to send the message to.
   * @param args Additional arguments for the message.
   */
  send(channel: string, ...args: unknown[]): void;
}

export type OpenAIMessage = {
  role: "user" | "assistant";
  content: string;
};

// Extend OpenAIMessage to create ChatbotMessage, adding messageType property
export type ChatbotMessage = OpenAIMessage & {
  messageType: "success" | "error";
};

// export type ChatbotMessageType = ;
