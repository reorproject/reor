import Store from 'electron-store'

import { LLMConfig, LLMAPIConfig, StoreKeys, StoreSchema } from '../electron-store/storeConfig'

import OllamaService from './models/Ollama'

export async function addOrUpdateLLMAPIInStore(store: Store<StoreSchema>, newAPI: LLMAPIConfig): Promise<void> {
  const existingAPIsInStore = await store.get(StoreKeys.LLMAPIs)

  const foundAPI = existingAPIsInStore.find((api) => api.name === newAPI.name)

  if (foundAPI) {
    const updatedModels = existingAPIsInStore.map((api) => (api.name === newAPI.name ? newAPI : api))
    store.set(StoreKeys.LLMAPIs, updatedModels)
  } else {
    const updatedModels = [...existingAPIsInStore, newAPI]
    store.set(StoreKeys.LLMAPIs, updatedModels)
  }
}

export async function addOrUpdateLLMInStore(store: Store<StoreSchema>, newLLM: LLMConfig): Promise<void> {
  const existingLLMs = store.get(StoreKeys.LLMs) || []

  const foundLLM = existingLLMs.find((llm) => llm.modelName === newLLM.modelName)

  if (foundLLM) {
    const updatedLLMs = existingLLMs.map((llm) => (llm.modelName === newLLM.modelName ? newLLM : llm))
    store.set(StoreKeys.LLMs, updatedLLMs)
  } else {
    const updatedLLMs = [...existingLLMs, newLLM]
    store.set(StoreKeys.LLMs, updatedLLMs)
  }
}

export async function getLLMConfigs(store: Store<StoreSchema>, ollamaSession: OllamaService): Promise<LLMConfig[]> {
  const llmConfigsFromStore = store.get(StoreKeys.LLMs)
  const ollamaLLMConfigs = await ollamaSession.getAvailableModels()

  return [...llmConfigsFromStore, ...ollamaLLMConfigs]
}

export async function getLLMConfig(
  store: Store<StoreSchema>,
  ollamaSession: OllamaService,
  modelName: string,
): Promise<LLMConfig | undefined> {
  const llmConfigs = await getLLMConfigs(store, ollamaSession)

  if (llmConfigs) {
    return llmConfigs.find((model: LLMConfig) => model.modelName === modelName)
  }
  return undefined
}

export async function removeLLM(
  store: Store<StoreSchema>,
  ollamaService: OllamaService,
  modelName: string,
): Promise<void> {
  const existingLLMs = store.get(StoreKeys.LLMs) || []

  const foundLLM = await getLLMConfig(store, ollamaService, modelName)

  if (!foundLLM) {
    return
  }

  const updatedLLMs = existingLLMs.filter((llm) => llm.modelName !== modelName)
  store.set(StoreKeys.LLMAPIs, updatedLLMs)

  ollamaService.deleteModel(modelName)
}
