import { AnthropicLLMConfig, OpenAILLMConfig } from 'electron/main/electron-store/storeConfig'
import { ProgressResponse } from 'ollama'

const downloadPercentage = (progress: ProgressResponse): string => {
  // Check if `total` is 0, undefined, or not a number to avoid division by zero or invalid operations
  if (
    !progress.total ||
    Number.isNaN(progress.total) ||
    progress.total === 0 ||
    !progress.completed ||
    Number.isNaN(progress.completed)
  ) {
    // Depending on your logic, you might want to return 0, or handle this case differently
    return 'checking...'
  }

  const percentage = (100 * progress.completed) / progress.total

  return `${percentage.toFixed(2)}%`
}

export const openAIDefaultModels: OpenAILLMConfig[] = [
  {
    contextLength: 128000,
    modelName: 'gpt-4o',
    engine: 'openai',
    type: 'openai',
    apiKey: '',
    apiURL: '',
  },
  {
    contextLength: 16385,
    modelName: 'gpt-3.5-turbo',
    engine: 'openai',
    type: 'openai',
    apiKey: '',
    apiURL: '',
  },
  {
    contextLength: 128000,
    modelName: 'gpt-4-turbo',
    engine: 'openai',
    type: 'openai',
    apiKey: '',
    apiURL: '',
  },
]

export const AnthropicDefaultModels: AnthropicLLMConfig[] = [
  {
    contextLength: 180000,
    modelName: 'claude-3-5-sonnet-20240620',
    engine: 'anthropic',
    type: 'anthropic',
    apiKey: '',
    apiURL: '',
  },
]

export default downloadPercentage
