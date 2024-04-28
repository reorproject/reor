import OpenAI from "openai";
import { LLMSessionService } from "../Types";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import {
  LLMGenerationParameters,
  OpenAILLMConfig,
} from "electron/main/Store/storeConfig";

import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { customFetchUsingElectronNetStreaming } from "../../Generic/network";
import { ChatMessageToDisplay } from "@/components/Chat/Chat";

export class OpenAIModelSessionService implements LLMSessionService {
  public getTokenizer = (llmName: string): ((text: string) => number[]) => {
    let tokenEncoding: Tiktoken;
    try {
      tokenEncoding = encodingForModel(llmName as TiktokenModel);
    } catch (e) {
      tokenEncoding = encodingForModel("gpt-3.5-turbo-1106"); // hack while we think about what to do with custom remote models' tokenizers
    }
    const tokenize = (text: string): number[] => {
      return tokenEncoding.encode(text);
    };
    return tokenize;
  };

  public abort(): void {
    throw new Error("Abort not yet implemented.");
  }

  async response(
    modelName: string,
    modelConfig: OpenAILLMConfig,
    messageHistory: ChatCompletionMessageParam[],
    isJSONMode: boolean,
    generationParams?: LLMGenerationParameters
  ): Promise<ChatCompletion> {
    const openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    });
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: messageHistory,
      max_tokens: generationParams?.maxTokens,
      temperature: generationParams?.temperature,
      response_format: {
        type: isJSONMode ? "json_object" : "text",
      },
    });
    return response;
  }

  async streamingResponse(
    modelName: string,
    modelConfig: OpenAILLMConfig,
    isJSONMode: boolean,
    messageHistory: ChatMessageToDisplay[],
    handleChunk: (chunk: ChatCompletionChunk) => void,
    generationParams?: LLMGenerationParameters
  ): Promise<void> {
    console.log("making call to url: ", modelConfig);
    const openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    });
    console.log("messageHistory: ");

    const stream = await openai.chat.completions.create({
      model: modelName,
      messages: messageHistory.map(cleanMessage),
      stream: true,
      max_tokens: generationParams?.maxTokens,
      temperature: generationParams?.temperature,
      response_format: {
        type: isJSONMode ? "json_object" : "text",
      },
    });

    for await (const chunk of stream) {
      handleChunk(chunk);
    }
  }
}

function cleanMessage(
  message: ChatMessageToDisplay
): ChatCompletionMessageParam {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { messageType, context, visibleContent, ...cleanMessage } = message;
  return cleanMessage;
}
