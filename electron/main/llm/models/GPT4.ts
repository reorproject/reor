import OpenAI from "openai";
import { IModel, ISendFunctionImplementer, ISessionService } from "../Types";

export class GPT4Model implements IModel {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async loadModel(): Promise<void> {
    // Model loading logic is not applicable for an API-based approach
    // The OpenAI client is ready to be used
  }

  async unloadModel(): Promise<void> {
    // Unloading logic might not be applicable for an API model
  }

  isModelLoaded(): boolean {
    // For API-based models, this can always return true as there's no "loading" process
    return true;
  }

  get client(): OpenAI {
    return this.openai;
  }
}
export class GPT4SessionService implements ISessionService {
  private model: GPT4Model;
  private messageHistory: any[];

  constructor(model: GPT4Model) {
    this.model = model;
    this.messageHistory = [];
  }

  async init(): Promise<void> {
    await this.model.loadModel();
  }

  async streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer
  ): Promise<string> {
    if (!this.model.isModelLoaded()) {
      throw new Error("Model not initialized");
    }

    // Add the user's prompt to the message history
    this.messageHistory.push({ role: "user", content: prompt });

    try {
      const stream = await this.model.client.chat.completions.create({
        model: "gpt-4",
        messages: this.messageHistory,
        stream: true,
      });

      let result = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        result += content;

        // Update the message history with the response
        this.messageHistory.push({ role: "assistant", content });
        sendFunctionImplementer.send("tokenStream", content);
      }

      return result;
    } catch (error) {
      console.error("Error during GPT-4 streaming session:", error);
      throw error;
    }
  }
}
