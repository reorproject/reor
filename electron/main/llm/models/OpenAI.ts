import OpenAI from "openai";
import {
  ChatbotMessage,
  ISendFunctionImplementer,
  ISessionService,
  OpenAIMessage,
} from "../Types";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import { OpenAIAIModelConfig } from "electron/main/Store/storeConfig";

export class OpenAIModelSessionService implements ISessionService {
  private openai: OpenAI;
  public modelName: string;
  private messageHistory: ChatbotMessage[];
  private abortStreaming: boolean = false;
  private tokenEncoding: Tiktoken;
  private modelConfig: OpenAIAIModelConfig;

  constructor(modelName: string, modelConfig: OpenAIAIModelConfig) {
    this.openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
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

  async init(): Promise<void> {
    // Since there's no model loading process for OpenAI, we can consider it initialized here
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
    sendFunctionImplementer: ISendFunctionImplementer
  ): Promise<string> {
    if (!this.isModelLoaded()) {
      throw new Error("Model not initialized");
    }
    this.abortStreaming = false;

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
