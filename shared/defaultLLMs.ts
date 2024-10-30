import { LLMConfig } from 'electron/main/electron-store/storeConfig'

export const openAIDefaultAPIName = 'OpenAI'
export const anthropicDefaultAPIName = 'Anthropic'

export const openAIDefaultLLMs: LLMConfig[] = [
  {
    contextLength: 128000,
    modelName: 'gpt-4o',
    apiName: openAIDefaultAPIName,
  },
  {
    contextLength: 128000,
    modelName: 'gpt-4o-mini',
    apiName: openAIDefaultAPIName,
  },
  {
    contextLength: 16385,
    modelName: 'gpt-3.5-turbo',
    apiName: openAIDefaultAPIName,
  },
  {
    contextLength: 128000,
    modelName: 'gpt-4-turbo',
    apiName: openAIDefaultAPIName,
  },
]

export const anthropicDefaultLLMs: LLMConfig[] = [
  {
    contextLength: 180000,
    modelName: 'claude-3-5-sonnet-latest',
    apiName: anthropicDefaultAPIName,
  },
  {
    contextLength: 180000,
    modelName: 'claude-3-opus-latest',
    apiName: anthropicDefaultAPIName,
  },
  {
    contextLength: 180000,
    modelName: 'claude-3-haiku-20240307',
    apiName: anthropicDefaultAPIName,
  },
]
