/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */
import Anthropic from '@anthropic-ai/sdk'
import { Message, MessageParam, MessageStreamEvent } from '@anthropic-ai/sdk/resources'
import { LLMGenerationParameters, LLMConfig } from 'electron/main/electron-store/storeConfig'
import { Tiktoken, TiktokenModel, encodingForModel } from 'js-tiktoken'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

import { customFetchUsingElectronNetStreaming } from '../../common/network'
import { LLMSessionService } from '../types'
import cleanMessageForAnthropic from '../utils'

class AnthropicModelSessionService implements LLMSessionService {
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
  ): Promise<Message> {
    const anthropic = new Anthropic({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    })
    const msg = await anthropic.messages.create({
      model: modelName,
      messages: messageHistory as MessageParam[],
      temperature: generationParams?.temperature,
      max_tokens: generationParams?.maxTokens || 1024,
    })

    return msg
  }

  async streamingResponse(
    modelName: string,
    modelConfig: LLMConfig,
    isJSONMode: boolean,
    messageHistory: ChatCompletionMessageParam[],
    handleChunk: (chunk: MessageStreamEvent) => void,
    generationParams?: LLMGenerationParameters,
  ): Promise<void> {
    const anthropic = new Anthropic({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.apiURL,
      fetch: customFetchUsingElectronNetStreaming,
    })

    const stream = await anthropic.messages.create({
      model: modelName,
      messages: messageHistory.map(cleanMessageForAnthropic),
      stream: true,
      temperature: generationParams?.temperature,
      max_tokens: generationParams?.maxTokens || 1024,
    })
    for await (const messageStreamEvent of stream) {
      handleChunk(messageStreamEvent)
    }
  }
}

export default AnthropicModelSessionService
