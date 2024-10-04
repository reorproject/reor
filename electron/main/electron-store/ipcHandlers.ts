import path from 'path'

import { ipcMain } from 'electron'
import Store from 'electron-store'
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  StoreKeys,
  StoreSchema,
} from './storeConfig'

import WindowsManager from '../common/windowManager'

import { initializeAndMaybeMigrateStore } from './storeSchemaMigrator'
import { Chat, ChatMetadata } from '@/components/Chat/types'

export const registerStoreHandlers = (store: Store<StoreSchema>, windowsManager: WindowsManager) => {
  initializeAndMaybeMigrateStore(store)
  ipcMain.handle('set-vault-directory-for-window', async (event, userDirectory: string): Promise<void> => {
    windowsManager.setVaultDirectoryForContents(event.sender, userDirectory, store)
  })

  ipcMain.handle('get-vault-directory-for-window', (event) => {
    let vaultPathForWindow = windowsManager.getVaultDirectoryForWinContents(event.sender)
    if (!vaultPathForWindow) {
      vaultPathForWindow = windowsManager.getAndSetupDirectoryForWindowFromPreviousAppSession(event.sender, store)
    }
    return vaultPathForWindow
  })
  ipcMain.handle('set-default-embedding-model', (event, repoName: string) => {
    store.set(StoreKeys.DefaultEmbeddingModelAlias, repoName)
  })

  ipcMain.handle('add-new-local-embedding-model', (event, model: EmbeddingModelWithLocalPath) => {
    const currentModels = store.get(StoreKeys.EmbeddingModels) || {}
    const modelAlias = path.basename(model.localPath)
    store.set(StoreKeys.EmbeddingModels, {
      ...currentModels,
      [modelAlias]: model,
    })
    store.set(StoreKeys.DefaultEmbeddingModelAlias, modelAlias)
  })

  ipcMain.handle('add-new-repo-embedding-model', (event, model: EmbeddingModelWithRepo) => {
    const currentModels = store.get(StoreKeys.EmbeddingModels) || {}
    store.set(StoreKeys.EmbeddingModels, {
      ...currentModels,
      [model.repoName]: model,
    })
    store.set(StoreKeys.DefaultEmbeddingModelAlias, model.repoName)
  })

  ipcMain.handle('get-embedding-models', () => store.get(StoreKeys.EmbeddingModels))

  ipcMain.handle(
    'update-embedding-model',
    (event, modelName: string, updatedModel: EmbeddingModelWithLocalPath | EmbeddingModelWithRepo) => {
      const currentModels = store.get(StoreKeys.EmbeddingModels) || {}
      store.set(StoreKeys.EmbeddingModels, {
        ...currentModels,
        [modelName]: updatedModel,
      })
    },
  )

  ipcMain.handle('remove-embedding-model', (event, modelName: string) => {
    const currentModels = store.get(StoreKeys.EmbeddingModels) || {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [modelName]: unused, ...updatedModels } = currentModels

    store.set(StoreKeys.EmbeddingModels, updatedModels)
  })

  ipcMain.handle('set-no-of-rag-examples', (event, noOfExamples: number) => {
    store.set(StoreKeys.MaxRAGExamples, noOfExamples)
  })

  ipcMain.handle('get-no-of-rag-examples', () => store.get(StoreKeys.MaxRAGExamples))

  ipcMain.handle('set-chunk-size', (event, chunkSize: number) => {
    store.set(StoreKeys.ChunkSize, chunkSize)
  })

  ipcMain.handle('get-chunk-size', () => store.get(StoreKeys.ChunkSize))

  ipcMain.handle('get-default-embedding-model', () => store.get(StoreKeys.DefaultEmbeddingModelAlias))

  ipcMain.handle('set-llm-generation-params', (event, generationParams) => {
    store.set(StoreKeys.LLMGenerationParameters, generationParams)
  })

  ipcMain.handle('get-llm-generation-params', () => {
    return store.get(StoreKeys.LLMGenerationParameters)
  })

  ipcMain.handle('set-sb-compact', (event, isSBCompact) => {
    store.set(StoreKeys.IsSBCompact, isSBCompact)
    event.sender.send('sb-compact-changed', isSBCompact)
  })

  ipcMain.handle('get-sb-compact', () => store.get(StoreKeys.IsSBCompact))

  ipcMain.handle('get-editor-flex-center', () => store.get(StoreKeys.EditorFlexCenter))

  ipcMain.handle('set-editor-flex-center', (event, setEditorFlexCenter) => {
    store.set(StoreKeys.EditorFlexCenter, setEditorFlexCenter)
    event.sender.send('editor-flex-center-changed', setEditorFlexCenter)
  })

  ipcMain.handle('set-analytics-mode', (event, isAnalytics) => {
    store.set(StoreKeys.Analytics, isAnalytics)
  })

  ipcMain.handle('get-analytics-mode', () => {
    return store.get(StoreKeys.Analytics)
  })

  ipcMain.handle('set-spellcheck-mode', (event, isSpellCheck) => {
    store.set(StoreKeys.SpellCheck, isSpellCheck)
  })

  ipcMain.handle('get-spellcheck-mode', () => {
    return store.get(StoreKeys.SpellCheck)
  })

  ipcMain.handle('set-document-stats', (event, showDocumentStats: boolean) => {
    store.set(StoreKeys.showDocumentStats, showDocumentStats)
    event.sender.send('show-doc-stats-changed', showDocumentStats)
  })

  ipcMain.handle('get-document-stats', () => {
    return store.get(StoreKeys.showDocumentStats, false)
  })

  ipcMain.handle('has-user-opened-app-before', () => store.get(StoreKeys.hasUserOpenedAppBefore))

  ipcMain.handle('set-user-has-opened-app-before', () => {
    store.set(StoreKeys.hasUserOpenedAppBefore, true)
  })

  ipcMain.handle('get-all-chats-metadata', (event) => {
    const vaultDir = windowsManager.getVaultDirectoryForWinContents(event.sender)

    if (!vaultDir) {
      return []
    }

    const allHistories = store.get(StoreKeys.Chats)
    const chatHistoriesCorrespondingToVault = allHistories?.[vaultDir] ?? []
    return chatHistoriesCorrespondingToVault.map(({ messages, ...rest }) => rest) as ChatMetadata[]
  })

  ipcMain.handle('save-chat', (event, newChat: Chat) => {
    const vaultDir = windowsManager.getVaultDirectoryForWinContents(event.sender)
    if (!vaultDir) {
      return
    }

    const allChatHistories = store.get(StoreKeys.Chats)
    const chatHistoriesCorrespondingToVault = allChatHistories?.[vaultDir] ?? []

    const existingChatIndex = chatHistoriesCorrespondingToVault.findIndex((chat) => chat.id === newChat.id)
    if (existingChatIndex !== -1) {
      chatHistoriesCorrespondingToVault[existingChatIndex] = newChat
    } else {
      chatHistoriesCorrespondingToVault.push(newChat)
    }
    store.set(StoreKeys.Chats, {
      ...allChatHistories,
      [vaultDir]: chatHistoriesCorrespondingToVault,
    })
  })

  ipcMain.handle('get-chat', (event, chatId: string | undefined) => {
    if (!chatId) {
      return undefined
    }
    const vaultDir = windowsManager.getVaultDirectoryForWinContents(event.sender)
    if (!vaultDir) {
      return null
    }
    const allChatHistories = store.get(StoreKeys.Chats)
    const vaultChatHistories = allChatHistories[vaultDir] || []
    return vaultChatHistories.find((chat) => chat.id === chatId)
  })

  ipcMain.handle('delete-chat', (event, chatID: string | undefined) => {
    if (!chatID) return
    const vaultDir = windowsManager.getVaultDirectoryForWinContents(event.sender)

    if (!vaultDir) {
      return
    }

    const chatHistoriesMap = store.get(StoreKeys.Chats)
    const allChatHistories = chatHistoriesMap[vaultDir] || []
    const filteredChatHistories = allChatHistories.filter((item) => item.id !== chatID)

    chatHistoriesMap[vaultDir] = filteredChatHistories
    store.set(StoreKeys.Chats, chatHistoriesMap)
  })
}

export function getDefaultEmbeddingModelConfig(store: Store<StoreSchema>): EmbeddingModelConfig {
  const defaultEmbeddingModelAlias = store.get(StoreKeys.DefaultEmbeddingModelAlias) as string | undefined

  // Check if the default model alias is defined and not empty
  if (!defaultEmbeddingModelAlias) {
    throw new Error('No default embedding model is specified')
  }

  const embeddingModels = store.get(StoreKeys.EmbeddingModels) || {}

  // Check if the model with the default alias exists
  const model = embeddingModels[defaultEmbeddingModelAlias]
  if (!model) {
    throw new Error(`No embedding model found for alias '${defaultEmbeddingModelAlias}'`)
  }

  return model
}
