import Store from 'electron-store'

import { StoreKeys, StoreSchema } from './storeConfig'
import { defaultEmbeddingModelRepos } from '../vector-database/embeddings'

const currentSchemaVersion = 1

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

const setupDefaultHardwareConfig = (store: Store<StoreSchema>) => {
  const hardwareConfig = store.get(StoreKeys.Hardware)

  if (!hardwareConfig) {
    store.set(StoreKeys.Hardware, {
      useGPU: process.platform === 'darwin' && process.arch === 'arm64',
      useCUDA: false,
      useVulkan: false,
    })
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

export function setupDefaultStoreValues(store: Store<StoreSchema>) {
  if (!store.get(StoreKeys.MaxRAGExamples)) {
    store.set(StoreKeys.MaxRAGExamples, 15)
  }

  if (!store.get(StoreKeys.ChunkSize)) {
    store.set(StoreKeys.ChunkSize, 500)
  }

  setupDefaultAnalyticsValue(store)

  setupDefaultSpellCheckValue(store)

  setupDefaultEmbeddingModels(store)

  setupDefaultHardwareConfig(store)
}

export const initializeAndMaybeMigrateStore = (store: Store<StoreSchema>) => {
  const storeSchemaVersion = store.get(StoreKeys.SchemaVersion)
  if (storeSchemaVersion !== currentSchemaVersion) {
    store.set(StoreKeys.SchemaVersion, currentSchemaVersion)
    store.set(StoreKeys.LLMs, [])
    store.set(StoreKeys.DefaultLLM, '')
  }
  setupDefaultStoreValues(store)
}
