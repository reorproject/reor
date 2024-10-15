import { AgentConfig, Chat } from '@/lib/llm/types'

export type APIInterface = 'openai' | 'anthropic' | 'ollama'

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
  description?: string
  readableName?: string
}

export interface EmbeddingModelWithLocalPath {
  type: 'local'
  localPath: string
  description?: string
  readableName?: string
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
  chats: {
    [vaultDir: string]: Chat[]
  }
  agentConfigs: AgentConfig[]
  analytics?: boolean
  chunkSize: number
  isSBCompact: boolean
  spellCheck: string
  EditorFlexCenter: boolean
  showDocumentStats: boolean
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
  Chats = 'chats',
  AgentConfigs = 'agentConfigs',
  ChunkSize = 'chunkSize',
  IsSBCompact = 'isSBCompact',
  SpellCheck = 'spellCheck',
  EditorFlexCenter = 'editorFlexCenter',
  showDocumentStats = 'showDocumentStats',
}
