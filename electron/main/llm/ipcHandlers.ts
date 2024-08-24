import { ipcMain } from 'electron'
import Store from 'electron-store'
import { ProgressResponse } from 'ollama'

import { LLM, LLMAPIConfig, StoreKeys, StoreSchema } from '../electron-store/storeConfig'

// import { sliceStringToContextLength } from './contextLimit'
import { addOrUpdateLLMAPIInStore, removeLLM, getLLMConfigs, addOrUpdateLLMInStore } from './llmConfig'
import AnthropicModelSessionService from './models/Anthropic'
import OllamaService from './models/Ollama'
import OpenAIModelSessionService from './models/OpenAI'

// enum LLMType {
//   OpenAI = 'openai',
//   Anthropic = 'anthropic',
// }

// export const LLMSessions: { [sessionId: string]: LLMSessionService } = {}

export const openAISession = new OpenAIModelSessionService()
export const anthropicSession = new AnthropicModelSessionService()

export const ollamaService = new OllamaService()

export const registerLLMSessionHandlers = (store: Store<StoreSchema>) => {
  // ipcMain.handle(
  //   'streaming-llm-response',
  //   async (
  //     event: IpcMainInvokeEvent,
  //     llmName: string,
  //     llmConfig: LLMAPIConfig,
  //     isJSONMode: boolean,
  //     chatHistory: ChatHistory,
  //   ): Promise<void> => {
  //     const handleOpenAIChunk = (chunk: ChatCompletionChunk) => {
  //       event.sender.send('openAITokenStream', chatHistory.id, chunk)
  //     }

  //     const handleAnthropicChunk = (chunk: MessageStreamEvent) => {
  //       event.sender.send('anthropicTokenStream', chatHistory.id, chunk)
  //     }

  //     switch (llmConfig.engine) {
  //       case LLMType.OpenAI:
  //         await openAISession.streamingResponse(
  //           llmName,
  //           llmConfig,
  //           isJSONMode,
  //           chatHistory.displayableChatHistory,
  //           handleOpenAIChunk,
  //           store.get(StoreKeys.LLMGenerationParameters),
  //         )
  //         break
  //       case LLMType.Anthropic:
  //         await anthropicSession.streamingResponse(
  //           llmName,
  //           llmConfig,
  //           isJSONMode,
  //           chatHistory.displayableChatHistory,
  //           handleAnthropicChunk,
  //           store.get(StoreKeys.LLMGenerationParameters),
  //         )
  //         break
  //       default:
  //         throw new Error(`LLM type ${llmConfig.engine} not supported.`)
  //     }
  //   },
  // )
  ipcMain.handle('set-default-llm', (event, modelName: string) => {
    store.set(StoreKeys.DefaultLLM, modelName)
  })

  ipcMain.handle('get-default-llm-name', () => store.get(StoreKeys.DefaultLLM))

  ipcMain.handle('get-llm-configs', async () => getLLMConfigs(store, ollamaService))

  ipcMain.handle('get-llm-api-configs', async () => store.get(StoreKeys.LLMAPIs))

  ipcMain.handle('add-or-update-llm-config', async (event, llmConfig: LLM) => {
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
