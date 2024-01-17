import OpenAI from "openai";
import {
  ChatbotMessage,
  ISendFunctionImplementer,
  ISessionService,
} from "../Types";

export class OpenAIModelSessionService implements ISessionService {
  private openai: OpenAI;
  public modelName: string;
  private messageHistory: ChatbotMessage[];

  constructor(apiKey: string, modelName: string) {
    this.openai = new OpenAI({ apiKey });
    this.modelName = modelName;
    this.messageHistory = [];
  }

  async init(): Promise<void> {
    // Since there's no model loading process for OpenAI, we can consider it initialized here
  }

  private isModelLoaded(): boolean {
    // For API-based models, this can always return true as there's no "loading" process
    return true;
  }

  async streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer,
    apiKey?: string
  ): Promise<string> {
    if (!this.isModelLoaded()) {
      throw new Error("Model not initialized");
    }

    // Add the user's prompt to the message history
    this.messageHistory.push({ role: "user", content: prompt });

    try {
      if (apiKey) {
        this.openai.apiKey = apiKey;
      }
      const stream = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: this.messageHistory,
        stream: true,
      });

      let result = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        result += content;

        // Update the message history with the response
        this.messageHistory.push({ role: "assistant", content });

        sendFunctionImplementer.send("tokenStream", {
          messageType: "success",
          message: content,
        });
      }

      return result;
    } catch (error) {
      console.error("Error during OpenAI streaming session:", error);
      sendFunctionImplementer.send("tokenStream", {
        messageType: "error",
        message: "Error during OpenAI streaming session: " + error + "\n",
      });
      return "error";
    }
  }
}
