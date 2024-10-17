import { ipcMain } from 'electron'
import Store from 'electron-store'
import { ProgressResponse } from 'ollama'

import { LLMConfig, LLMAPIConfig, StoreKeys, StoreSchema } from '../electron-store/storeConfig'

import { addOrUpdateLLMAPIInStore, removeLLM, getLLMConfigs, addOrUpdateLLMInStore } from './llmConfig'
import OllamaService from './models/ollama'

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

  ipcMain.handle('get-available-models', async () => {
    try {
      const models = await ollamaService.getAvailableModels()
      return models
    } catch (error) {
      console.error('Error fetching available models:', error)
      throw error
    }
  })
  

  ipcMain.handle('delete-llm', async (event, modelName: string) => {
    try {
      const currentModels = store.get(StoreKeys.EmbeddingModels) || {}
      if (!currentModels[modelName]) {
        throw new Error(`Model ${modelName} not found in the store`)
      }

      await ollamaService.deleteModel(modelName)
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { [modelName]: _, ...updatedModels } = currentModels
      store.set(StoreKeys.EmbeddingModels, updatedModels)

      return { success: true }
    } catch (error: any) {
      console.error(`Failed to delete model: ${modelName}`, error)
      return { success: false, error: error.message }
    }
  })
}
