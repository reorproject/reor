import { Chat } from '@/components/Chat/chatUtils'

// a type for possible values of the apiInterface field in LLMAPIConfig: containing 'openai' | 'anthropic'
export type APIInterface = 'openai' | 'anthropic'

export interface LLMAPIConfig {
  name: string
  apiInterface: APIInterface
  apiURL?: string
  apiKey?: string
}

// export interface OpenAIAPIConfig extends BaseLLMAPIConfig {
//   apiInterface: 'openai'
//   name: 'OpenAI'
// }

// export interface AnthropicAPIConfig extends BaseLLMAPIConfig {
//   apiInterface: 'anthropic'
//   name: 'Anthropic'
// }

// export type LLMAPIConfig = OpenAIAPIConfig | AnthropicAPIConfig

// Ah nah so the Ollama API will need to be setup from the start...Let's see how the migration code works overall

// export const

// so apparently the idea right now is that we can have some default APIs including Ollama
// so the frontend can setup the default APIs when the user adds an OpenAI key
// And then we'll have the Ollama API get setup when a user adds a model from Ollama
// And then afterwards we can do stuff to update

// export const openAIDefaultAPI: LLMAPIConfig = {
//   name: openAIDefaultName,
//   apiInterface: 'openai',
// }

// export const anthropicDefaultAPI: LLMAPIConfig = {
//   name: anthropicDefaultName,
//   apiInterface: 'anthropic',
// }

export interface LLM {
  modelName: string
  apiName: string
  contextLength?: number
}

// actually so like the models themselves, we could just define default APIs

export type LLMGenerationParameters = {
  maxTokens?: number
  temperature?: number
}

export type EmbeddingModelConfig = EmbeddingModelWithRepo | EmbeddingModelWithLocalPath

export interface EmbeddingModelWithRepo {
  type: 'repo'
  repoName: string
}

export interface EmbeddingModelWithLocalPath {
  type: 'local'
  localPath: string
}

export type Tab = {
  id: string // Unique ID for the tab, useful for operations
  path: string // Path to the content open in the tab
  title: string // Title of the tab
  lastAccessed: boolean
  // timeOpened: Date; // Timestamp to preserve order
  // isDirty: boolean; // Flag to indicate unsaved changes
}

export interface StoreSchema {
  hasUserOpenedAppBefore: boolean
  schemaVersion: number
  user: {
    vaultDirectories: string[]
    directoryFromPreviousSession?: string
  }
  LLMs: LLM[]
  LLMAPIs: LLMAPIConfig[]
  embeddingModels: {
    [modelAlias: string]: EmbeddingModelConfig
  }
  defaultLLM: string
  defaultEmbedFuncRepo: string
  llmGenerationParameters: LLMGenerationParameters
  chatHistories: {
    [vaultDir: string]: Chat[]
  }
  analytics?: boolean
  chunkSize: number
  isSBCompact: boolean
  DisplayMarkdown: boolean
  spellCheck: string
  EditorFlexCenter: boolean
  OpenTabs: Tab[]
}

export enum StoreKeys {
  hasUserOpenedAppBefore = 'hasUserOpenedAppBefore',
  Analytics = 'analytics',
  SchemaVersion = 'schemaVersion',
  DirectoryFromPreviousSession = 'user.directoryFromPreviousSession',
  LLMs = 'LLMs',
  LLMAPIs = 'LLMAPIs',
  EmbeddingModels = 'embeddingModels',
  DefaultLLM = 'defaultLLM',
  DefaultEmbeddingModelAlias = 'defaultEmbeddingModelAlias',
  MaxRAGExamples = 'RAG.maxRAGExamples',
  LLMGenerationParameters = 'llmGenerationParameters',
  ChatHistories = 'chatHistories',
  ChunkSize = 'chunkSize',
  IsSBCompact = 'isSBCompact',
  DisplayMarkdown = 'DisplayMarkdown',
  SpellCheck = 'spellCheck',
  EditorFlexCenter = 'editorFlexCenter',
  OpenTabs = 'OpenTabs',
}
