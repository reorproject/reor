export interface IModel {
  loadModel(): Promise<void>;
  unloadModel(): Promise<void>;
  isModelLoaded(): boolean;
}

export interface ISessionService {
  /**
   * Initializes the session.
   * @returns A promise that resolves when the initialization is complete.
   */
  init(): Promise<void>;

  /**
   * Handles the streaming of prompts.
   * @param prompt The prompt to be streamed.
   * @param sendFunctionImplementer The implementer of the send function.
   * @returns A promise that resolves to a string response.
   */
  streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer
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
  send(channel: string, ...args: any[]): void;
}
