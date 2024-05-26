import Anthropic from "@anthropic-ai/sdk";
import { LLMSessionService } from "../Types";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import {
  LLMGenerationParameters,
  LLMConfig,
} from "electron/main/Store/storeConfig";

import {
  Message,
  MessageParam,
  MessageStreamEvent,
} from "@anthropic-ai/sdk/resources";

import { customFetchUsingElectronNetStreaming } from "../../Generic/network";
import { ChatMessageToDisplay } from "@/components/Chat/Chat";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class AnthropicModelSessionService implements LLMSessionService {
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
    modelConfig: LLMConfig,
    messageHistory: ChatCompletionMessageParam[],
    isJSONMode: boolean,
    generationParams?: LLMGenerationParameters
  ): Promise<Message> {
    const anthropic = new Anthropic({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    });
    const msg = await anthropic.messages.create({
      model: modelName,
      messages: messageHistory as MessageParam[],
      temperature: generationParams?.temperature,
      max_tokens: generationParams?.maxTokens || 1024,
    });

    return msg;
  }

  async streamingResponse(
    modelName: string,
    modelConfig: LLMConfig,
    isJSONMode: boolean,
    messageHistory: ChatMessageToDisplay[],
    handleChunk: (chunk: MessageStreamEvent) => void,
    generationParams?: LLMGenerationParameters
  ): Promise<void> {
    console.log("making call to url: ", modelConfig);
    const anthropic = new Anthropic({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    });
    console.log("messageHistory: ", messageHistory);

    const stream = await anthropic.messages.create({
      model: modelName,
      messages: messageHistory.map(cleanMessage) as MessageParam[],
      stream: true,
      temperature: generationParams?.temperature,
      max_tokens: generationParams?.maxTokens || 1024,
    });
    for await (const messageStreamEvent of stream) {
      handleChunk(messageStreamEvent);
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
