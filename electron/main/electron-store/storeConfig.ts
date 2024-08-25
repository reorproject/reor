import { Chat } from '@/components/Chat/chatUtils'

export type APIInterface = 'openai' | 'anthropic'

export interface LLMAPIConfig {
  name: string
  apiInterface: APIInterface
  apiURL?: string
  apiKey?: string
}

export interface LLMConfig {
  modelName: string
  apiName: string
  contextLength?: number
}

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
  LLMs: LLMConfig[]
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
