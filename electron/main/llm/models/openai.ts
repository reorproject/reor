/* eslint-disable class-methods-use-this */
import { LLMGenerationParameters, LLMConfig } from 'electron/main/electron-store/storeConfig'
import { Tiktoken, TiktokenModel, encodingForModel } from 'js-tiktoken'
import OpenAI from 'openai'
import { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/chat/completions'

import { customFetchUsingElectronNetStreaming } from '../../common/network'
import { LLMSessionService } from '../types'

class OpenAIModelSessionService implements LLMSessionService {
  public getTokenizer = (llmName: string): ((text: string) => number[]) => {
    let tokenEncoding: Tiktoken
    try {
      tokenEncoding = encodingForModel(llmName as TiktokenModel)
    } catch (e) {
      tokenEncoding = encodingForModel('gpt-3.5-turbo-1106') // hack while we think about what to do with custom remote models' tokenizers
    }
    const tokenize = (text: string): number[] => tokenEncoding.encode(text)
    return tokenize
  }

  public abort(): void {
    throw new Error('Abort not yet implemented.')
  }

  async response(
    modelName: string,
    modelConfig: LLMConfig,
    messageHistory: ChatCompletionMessageParam[],
    isJSONMode: boolean,
    generationParams?: LLMGenerationParameters,
  ): Promise<ChatCompletion> {
    const openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    })
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: messageHistory,
      max_tokens: generationParams?.maxTokens,
      temperature: generationParams?.temperature,
      response_format: {
        type: isJSONMode ? 'json_object' : 'text',
      },
    })
    return response
  }

  async streamingResponse(
    modelName: string,
    modelConfig: LLMConfig,
    isJSONMode: boolean,
    messageHistory: ChatCompletionMessageParam[],
    handleChunk: (chunk: ChatCompletionChunk) => void,
    generationParams?: LLMGenerationParameters,
  ): Promise<void> {
    const openai = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    })

    const stream = await openai.chat.completions.create({
      model: modelName,
      messages: messageHistory,
      stream: true,
      max_tokens: generationParams?.maxTokens,
      temperature: generationParams?.temperature,
      response_format: {
        type: isJSONMode ? 'json_object' : 'text',
      },
    })

    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of stream) {
      handleChunk(chunk)
    }
  }
}

export default OpenAIModelSessionService
