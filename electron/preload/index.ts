import { contextBridge, ipcRenderer } from 'electron'
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  LLMConfig,
  LLMAPIConfig,
  LLMGenerationParameters,
} from 'electron/main/electron-store/storeConfig'
import { SearchProps } from 'electron/main/electron-store/types'
import { FileInfoTree, FileInfoWithContent, RenameFileProps, WriteFileProps } from 'electron/main/filesystem/types'
import { DBQueryResult } from 'electron/main/vector-database/schema'

import { AgentConfig, ChatMetadata, Chat } from '@/lib/llm/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IPCHandler<T extends (...args: any[]) => any> = (...args: Parameters<T>) => Promise<ReturnType<T>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createIPCHandler<T extends (...args: any[]) => any>(channel: string): IPCHandler<T> {
  return (...args: Parameters<T>) => ipcRenderer.invoke(channel, ...args) as Promise<ReturnType<T>>
}

const database = {
  search: createIPCHandler<(query: string, limit: number, filter?: string) => Promise<DBQueryResult[]>>('search'),
  deleteLanceDBEntriesByFilePath: createIPCHandler<(filePath: string) => Promise<void>>(
    'delete-lance-db-entries-by-filepath',
  ),
  indexFilesInDirectory: createIPCHandler<() => Promise<void>>('index-files-in-directory'),
  indexFileInDatabase: createIPCHandler<(filePath: string) => Promise<void>>('index-file-in-database'),
  getDatabaseFields: createIPCHandler<() => Promise<Record<string, string>>>('get-database-fields'),
}

const electronUtils = {
  openExternal: createIPCHandler<(url: string) => Promise<void>>('open-external'),
  getPlatform: createIPCHandler<() => Promise<string>>('get-platform'),
  openNewWindow: createIPCHandler<() => Promise<void>>('open-new-window'),
  getReorAppVersion: createIPCHandler<() => Promise<string>>('get-reor-app-version'),
}

const electronStore = {
  setVaultDirectoryForWindow: createIPCHandler<(path: string) => Promise<void>>('set-vault-directory-for-window'),
  getVaultDirectoryForWindow: createIPCHandler<() => Promise<string>>('get-vault-directory-for-window'),
  getDefaultEmbeddingModel: createIPCHandler<() => Promise<string>>('get-default-embedding-model'),
  setDefaultEmbeddingModel: createIPCHandler<(repoName: string) => Promise<void>>('set-default-embedding-model'),
  addNewLocalEmbeddingModel: createIPCHandler<(model: EmbeddingModelWithLocalPath) => Promise<void>>(
    'add-new-local-embedding-model',
  ),
  getEmbeddingModels: createIPCHandler<() => Promise<Record<string, EmbeddingModelConfig>>>('get-embedding-models'),
  addNewRepoEmbeddingModel:
    createIPCHandler<(model: EmbeddingModelWithRepo) => Promise<void>>('add-new-repo-embedding-model'),
  updateEmbeddingModel:
    createIPCHandler<
      (modelName: string, updatedModel: EmbeddingModelWithLocalPath | EmbeddingModelWithRepo) => Promise<void>
    >('update-embedding-model'),
  removeEmbeddingModel: createIPCHandler<(modelName: string) => Promise<void>>('remove-embedding-model'),
  getChunkSize: createIPCHandler<() => Promise<number>>('get-chunk-size'),
  setChunkSize: createIPCHandler<(chunkSize: number) => Promise<void>>('set-chunk-size'),
  getLLMGenerationParams: createIPCHandler<() => Promise<LLMGenerationParameters>>('get-llm-generation-params'),
  setLLMGenerationParams:
    createIPCHandler<(params: LLMGenerationParameters) => Promise<void>>('set-llm-generation-params'),
  getAnalyticsMode: createIPCHandler<() => Promise<boolean>>('get-analytics-mode'),
  setAnalyticsMode: createIPCHandler<(isAnalytics: boolean) => Promise<void>>('set-analytics-mode'),
  getSpellCheckMode: createIPCHandler<() => Promise<boolean>>('get-spellcheck-mode'),
  setSpellCheckMode: createIPCHandler<(isSpellCheck: boolean) => Promise<void>>('set-spellcheck-mode'),
  getDocumentStats: createIPCHandler<() => Promise<boolean>>('get-document-stats'),
  setDocumentStats: createIPCHandler<(showWordCount: boolean) => Promise<void>>('set-document-stats'),
  getHasUserOpenedAppBefore: createIPCHandler<() => Promise<boolean>>('has-user-opened-app-before'),
  setHasUserOpenedAppBefore: createIPCHandler<() => Promise<void>>('set-user-has-opened-app-before'),
  getAllChatsMetadata: createIPCHandler<() => Promise<ChatMetadata[]>>('get-all-chats-metadata'),
  saveChat: createIPCHandler<(chat: Chat) => Promise<void>>('save-chat'),
  deleteChat: createIPCHandler<(chatID: string) => Promise<void>>('delete-chat'),
  getChat: createIPCHandler<(chatID: string | undefined) => Promise<Chat | undefined>>('get-chat'),
  getEditorFlexCenter: createIPCHandler<() => Promise<boolean>>('get-editor-flex-center'),
  setEditorFlexCenter: createIPCHandler<(editorFlexCenter: boolean) => Promise<void>>('set-editor-flex-center'),
  getAgentConfigs: createIPCHandler<() => Promise<AgentConfig[]>>('get-agent-configs'),
  setAgentConfig: createIPCHandler<(agentConfig: AgentConfig) => Promise<void>>('set-agent-config'),
  setAutoContext: createIPCHandler<(value: boolean) => Promise<void>>('set-auto-context'),
  getAutoContext: createIPCHandler<() => Promise<boolean>>('get-auto-context'),
  getSearchParams: createIPCHandler<() => Promise<SearchProps>>('get-search-params'),
  setSearchParams: createIPCHandler<(searchParams: SearchProps) => Promise<void>>('set-search-params'),
}

const fileSystem = {
  openDirectoryDialog: createIPCHandler<() => Promise<string[]>>('open-directory-dialog'),
  openFileDialog: createIPCHandler<(fileExtensions?: string[]) => Promise<string[]>>('open-file-dialog'),
  getFilesTreeForWindow: createIPCHandler<() => Promise<FileInfoTree>>('get-files-tree-for-window'),
  readFile: createIPCHandler<(filePath: string) => Promise<string>>('read-file'),
  writeFile: createIPCHandler<(writeFileProps: WriteFileProps) => Promise<void>>('write-file'),
  isDirectory: createIPCHandler<(filePath: string) => Promise<boolean>>('is-directory'),
  renameFile: createIPCHandler<(renameFileProps: RenameFileProps) => Promise<void>>('rename-file'),
  createFile: createIPCHandler<(filePath: string, content: string) => Promise<void>>('create-file'),
  createDirectory: createIPCHandler<(dirPath: string) => Promise<void>>('create-directory'),
  checkFileExists: createIPCHandler<(filePath: string) => Promise<boolean>>('check-file-exists'),
  deleteFile: createIPCHandler<(filePath: string) => Promise<void>>('delete-file'),
  getAllFilenamesInDirectory: createIPCHandler<(dirName: string) => Promise<string[]>>('get-files-in-directory'),
  getFiles: createIPCHandler<(filePaths: string[]) => Promise<FileInfoWithContent[]>>('get-files'),
}

const path = {
  basename: createIPCHandler<(pathString: string) => Promise<string>>('path-basename'),
  join: createIPCHandler<(...pathSegments: string[]) => Promise<string>>('join-path'),
  dirname: createIPCHandler<(pathString: string) => Promise<string>>('path-dirname'),
  relative: createIPCHandler<(from: string, to: string) => Promise<string>>('path-relative'),
  isAbsolute: createIPCHandler<(filePath: string) => Promise<string>>('path-absolute'),
  addExtensionIfNoExtensionPresent: createIPCHandler<(pathString: string) => Promise<string>>(
    'add-extension-if-no-extension-present',
  ),
  pathSep: createIPCHandler<() => Promise<string>>('path-sep'),
  extName: createIPCHandler<(pathString: string) => Promise<string>>('path-ext-name'),
}

const llm = {
  getLLMConfigs: createIPCHandler<() => Promise<LLMConfig[]>>('get-llm-configs'),
  getLLMAPIConfigs: createIPCHandler<() => Promise<LLMAPIConfig[]>>('get-llm-api-configs'),
  addOrUpdateLLMConfig: createIPCHandler<(model: LLMConfig) => Promise<void>>('add-or-update-llm-config'),
  addOrUpdateLLMAPIConfig:
    createIPCHandler<(modelConfig: LLMAPIConfig) => Promise<void>>('add-or-update-llm-api-config'),
  removeLLM: createIPCHandler<(modelNameToDelete: string) => Promise<void>>('remove-llm'),
  setDefaultLLM: createIPCHandler<(modelName: string) => Promise<void>>('set-default-llm'),
  getDefaultLLMName: createIPCHandler<() => Promise<string>>('get-default-llm-name'),
  pullOllamaModel: createIPCHandler<(modelName: string) => Promise<void>>('pull-ollama-model'),
  deleteLLM: createIPCHandler<(modelNameToDelete: string) => Promise<void>>('delete-llm'),
}

// Expose to renderer process
contextBridge.exposeInMainWorld('database', database)
contextBridge.exposeInMainWorld('electronUtils', electronUtils)
contextBridge.exposeInMainWorld('electronStore', electronStore)
contextBridge.exposeInMainWorld('fileSystem', fileSystem)
contextBridge.exposeInMainWorld('path', path)
contextBridge.exposeInMainWorld('llm', llm)

// Additional exposures that don't fit the pattern above
contextBridge.exposeInMainWorld('ipcRenderer', {
  on: ipcRenderer.on.bind(ipcRenderer),
  receive: (channel: string, func: (...args: unknown[]) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => func(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
})

// Type declarations
declare global {
  interface Window {
    database: typeof database
    electronUtils: typeof electronUtils
    electronStore: typeof electronStore
    fileSystem: typeof fileSystem
    path: typeof path
    llm: typeof llm
    ipcRenderer: {
      on: typeof ipcRenderer.on
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      receive: (channel: string, func: (...args: any[]) => void) => () => void
    }
  }
}
