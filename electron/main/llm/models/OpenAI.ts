import OpenAI from "openai";
import { IModel, ISendFunctionImplementer, ISessionService } from "../Types";

export class OpenAIModel implements IModel {
  private openai: OpenAI;
  public modelName: string;

  constructor(apiKey: string, modelName: string) {
    this.openai = new OpenAI({ apiKey });
    this.modelName = modelName;
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
export class OpenAIModelSessionService implements ISessionService {
  private model: OpenAIModel;
  private messageHistory: any[];

  constructor(model: OpenAIModel) {
    this.model = model;
    this.messageHistory = [];
  }

  async init(): Promise<void> {
    await this.model.loadModel();
  }

  async streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer,
    apiKey?: string
  ): Promise<string> {
    if (!this.model.isModelLoaded()) {
      throw new Error("Model not initialized");
    }

    // Add the user's prompt to the message history
    this.messageHistory.push({ role: "user", content: prompt });

    try {
      if (apiKey) {
        this.model.client.apiKey = apiKey;
      }
      const stream = await this.model.client.chat.completions.create({
        model: this.model.modelName,
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
      // return error as string;
      sendFunctionImplementer.send("tokenStream", {
        messageType: "error",
        message: "Error during OpenAI streaming session: " + error + "\n",
      });
      return "error cunt";
    }
  }
}
