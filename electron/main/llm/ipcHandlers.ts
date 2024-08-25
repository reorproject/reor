import { ipcMain } from 'electron'
import Store from 'electron-store'
import { ProgressResponse } from 'ollama'

import { LLMConfig, LLMAPIConfig, StoreKeys, StoreSchema } from '../electron-store/storeConfig'

import { addOrUpdateLLMAPIInStore, removeLLM, getLLMConfigs, addOrUpdateLLMInStore } from './llmConfig'
import AnthropicModelSessionService from './models/Anthropic'
import OllamaService from './models/Ollama'
import OpenAIModelSessionService from './models/OpenAI'

export const openAISession = new OpenAIModelSessionService()
export const anthropicSession = new AnthropicModelSessionService()

export const ollamaService = new OllamaService()

export const registerLLMSessionHandlers = (store: Store<StoreSchema>) => {
  ipcMain.handle('set-default-llm', (event, modelName: string) => {
    store.set(StoreKeys.DefaultLLM, modelName)
  })

  ipcMain.handle('get-default-llm-name', () => store.get(StoreKeys.DefaultLLM))

  ipcMain.handle('get-llm-configs', async () => getLLMConfigs(store, ollamaService))

  ipcMain.handle('get-llm-api-configs', async () => store.get(StoreKeys.LLMAPIs))

  ipcMain.handle('add-or-update-llm-config', async (event, llmConfig: LLMConfig) => {
    await addOrUpdateLLMInStore(store, llmConfig)
  })

  ipcMain.handle('add-or-update-llm-api-config', async (event, llmAPIConfig: LLMAPIConfig) => {
    await addOrUpdateLLMAPIInStore(store, llmAPIConfig)
  })

  ipcMain.handle('remove-llm', async (event, modelNameToDelete: string) => {
    await removeLLM(store, ollamaService, modelNameToDelete)
  })

  ipcMain.handle('pull-ollama-model', async (event, modelName: string) => {
    const handleProgress = (progress: ProgressResponse) => {
      event.sender.send('ollamaDownloadProgress', modelName, progress)
    }
    await ollamaService.pullModel(modelName, handleProgress)
  })
}
