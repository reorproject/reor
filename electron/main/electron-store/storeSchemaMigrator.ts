import Store from 'electron-store'

import getDisplayableChatName from '../../../shared/utils'
import { StoreKeys, StoreSchema } from './storeConfig'
import { defaultEmbeddingModelRepos } from '../vector-database/embeddings'
import { defaultOllamaAPI } from '../llm/models/ollama'

const currentSchemaVersion = 2

const setupDefaultAnalyticsValue = (store: Store<StoreSchema>) => {
  if (store.get(StoreKeys.Analytics) === undefined) {
    store.set(StoreKeys.Analytics, true)
  }
}

const setupDefaultSpellCheckValue = (store: Store<StoreSchema>) => {
  if (store.get(StoreKeys.SpellCheck) === undefined) {
    store.set(StoreKeys.SpellCheck, 'false')
  }
}

const setupDefaultEmbeddingModels = (store: Store<StoreSchema>) => {
  const embeddingModels = store.get(StoreKeys.EmbeddingModels)

  if (!embeddingModels) {
    store.set(StoreKeys.EmbeddingModels, defaultEmbeddingModelRepos)
  }

  const defaultModel = store.get(StoreKeys.DefaultEmbeddingModelAlias)
  if (!defaultModel) {
    const storedEmbeddingModels = store.get(StoreKeys.EmbeddingModels) || {}
    if (Object.keys(storedEmbeddingModels).length === 0) {
      throw new Error('No embedding models found')
    }
    store.set(StoreKeys.DefaultEmbeddingModelAlias, Object.keys(storedEmbeddingModels)[0])
  }
}

export const setupDefaultLLMAPIs = (store: Store<StoreSchema>) => {
  const llmAPIs = store.get(StoreKeys.LLMAPIs)

  const existingOllamaAPI = llmAPIs?.find((api) => api.name === defaultOllamaAPI.name)
  if (!existingOllamaAPI) {
    store.set(StoreKeys.LLMAPIs, [defaultOllamaAPI])
  }
}

export function setupDefaultStoreValues(store: Store<StoreSchema>) {
  if (!store.get(StoreKeys.MaxRAGExamples)) {
    store.set(StoreKeys.MaxRAGExamples, 15)
  }

  if (!store.get(StoreKeys.ChunkSize)) {
    store.set(StoreKeys.ChunkSize, 1000)
  }

  setupDefaultAnalyticsValue(store)

  setupDefaultSpellCheckValue(store)

  setupDefaultEmbeddingModels(store)

  setupDefaultLLMAPIs(store)
}

function ensureChatHistoryIsCorrectProperty(store: Store<StoreSchema>) {
  const chatHistories = store.get(StoreKeys.ChatHistories)
  if (!chatHistories) {
    return
  }

  Object.keys(chatHistories).forEach((vaultDir) => {
    const chats = chatHistories[vaultDir]
    chats.map((chat) => {
      const outputChat = chat
      if (chat.displayableChatHistory) {
        outputChat.messages = chat.displayableChatHistory
        delete outputChat.displayableChatHistory
      }
      return outputChat
    })
    chatHistories[vaultDir] = chats
  })

  store.set(StoreKeys.ChatHistories, chatHistories)
}

function ensureChatHistoryHasDisplayNameAndTimestamp(store: Store<StoreSchema>) {
  const chatHistories = store.get(StoreKeys.ChatHistories)
  if (!chatHistories) {
    return
  }

  Object.keys(chatHistories).forEach((vaultDir) => {
    const chats = chatHistories[vaultDir]
    chats.map((chat) => {
      const outputChat = chat
      if (!outputChat.displayName || outputChat.displayName === chat.id) {
        outputChat.displayName = getDisplayableChatName(chat.messages)
      }
      if (!outputChat.timeOfLastMessage) {
        outputChat.timeOfLastMessage = Date.now()
      }
      return outputChat
    })
  })

  store.set(StoreKeys.ChatHistories, chatHistories)
}

export const initializeAndMaybeMigrateStore = (store: Store<StoreSchema>) => {
  const storeSchemaVersion = store.get(StoreKeys.SchemaVersion)
  if (storeSchemaVersion !== currentSchemaVersion) {
    store.set(StoreKeys.SchemaVersion, currentSchemaVersion)
    store.set(StoreKeys.LLMAPIs, [])
    store.set(StoreKeys.DefaultLLM, '')
  }

  ensureChatHistoryIsCorrectProperty(store)
  ensureChatHistoryHasDisplayNameAndTimestamp(store)
  setupDefaultStoreValues(store)
}
