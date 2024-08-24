import Store from 'electron-store'

import { LLM, LLMAPIConfig, StoreKeys, StoreSchema } from '../electron-store/storeConfig'

import OllamaService from './models/Ollama'

// export function validateAIModelConfig(config: LLMAPIConfig): string | null {
//   // Validate localPath: ensure it's not empty
//   if (!config.modelName.trim()) {
//     return 'Model name is required.'
//   }

//   // Validate contextLength: ensure it's a positive number
//   if (config.contextLength && config.contextLength <= 0) {
//     return 'Context length must be a positive number.'
//   }

//   // Validate engine: ensure it's either "openai" or "llamacpp"
//   if (config.engine !== 'openai' && config.type !== 'anthropic') {
//     return "Engine must be either 'openai' or 'llamacpp'."
//   }

//   // Optional field validation for errorMsg: ensure it's not empty if provided
//   if (config.errorMsg && !config.errorMsg.trim()) {
//     return 'Error message should not be empty if provided.'
//   }

//   return null
// }

export async function addOrUpdateLLMAPIInStore(store: Store<StoreSchema>, newAPI: LLMAPIConfig): Promise<void> {
  const existingAPIsInStore = await store.get(StoreKeys.LLMAPIs)

  // const isNotValid = validateAIModelConfig(modelConfig)
  // if (isNotValid) {
  //   throw new Error(isNotValid)
  // }

  const foundAPI = existingAPIsInStore.find((api) => api.name === newAPI.name)

  if (foundAPI) {
    const updatedModels = existingAPIsInStore.map((api) => (api.name === newAPI.name ? newAPI : api))
    store.set(StoreKeys.LLMAPIs, updatedModels)
  } else {
    const updatedModels = [...existingAPIsInStore, newAPI]
    store.set(StoreKeys.LLMAPIs, updatedModels)
  }
}

export async function addOrUpdateLLMInStore(store: Store<StoreSchema>, newLLM: LLM): Promise<void> {
  console.log('newLLM', newLLM)
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

export async function getLLMConfigs(store: Store<StoreSchema>, ollamaSession: OllamaService): Promise<LLM[]> {
  const llmConfigsFromStore = store.get(StoreKeys.LLMs)
  const ollamaLLMConfigs = await ollamaSession.getAvailableModels()

  return [...llmConfigsFromStore, ...ollamaLLMConfigs]
}

// export async function getLLMAPIConfigs(

export async function getLLMConfig(
  store: Store<StoreSchema>,
  ollamaSession: OllamaService,
  modelName: string,
): Promise<LLM | undefined> {
  const llmConfigs = await getLLMConfigs(store, ollamaSession)

  if (llmConfigs) {
    return llmConfigs.find((model: LLM) => model.modelName === modelName)
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
