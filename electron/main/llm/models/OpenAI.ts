import OpenAI from "openai";
import {
  ChatbotMessage,
  ISendFunctionImplementer,
  LLMSessionService,
  OpenAIMessage,
} from "../Types";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import {
  LLMGenerationParameters,
  OpenAILLMConfig,
} from "electron/main/Store/storeConfig";
import { customFetchUsingElectronNetStreamingForOpenAIReqs } from "../../networking/fetch";

export class OpenAIModelSessionService implements LLMSessionService {
  private openai!: OpenAI;
  public modelName!: string;
  private messageHistory!: ChatbotMessage[];
  private abortStreaming: boolean = false;
  private tokenEncoding!: Tiktoken;
  private modelConfig!: OpenAILLMConfig;

  async init(modelName: string, modelConfig: OpenAILLMConfig) {
    this.openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreamingForOpenAIReqs,
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
    sendFunctionImplementer: ISendFunctionImplementer,
    generationParams?: LLMGenerationParameters,
    ignoreChatHistory?: boolean
  ): Promise<string> {
    if (!this.isModelLoaded()) {
      throw new Error("Model not initialized");
    }
    this.abortStreaming = false;

    if (ignoreChatHistory) {
      this.messageHistory = [];
    }

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
        max_tokens: generationParams?.maxTokens,
        temperature: generationParams?.temperature,
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
