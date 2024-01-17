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
    apiKey?: string
  ): Promise<string>;
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

export type ChatbotMessage = {
  sender: "user" | "assistant";
  messageType: ChatbotMessageType;
  message: string;
};

export type ChatbotMessageType = "success" | "error";
