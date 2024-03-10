import { contextBridge, ipcRenderer } from "electron";
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  HardwareConfig,
  LLMGenerationParameters,
  LLMModelConfig,
} from "electron/main/Store/storeConfig";
import {
  AugmentPromptWithFileProps,
  FileInfoNode,
  FileInfoTree,
  WriteFileProps,
} from "electron/main/Files/Types";
import { DBEntry, DBQueryResult } from "electron/main/database/Schema";
import { PromptWithContextLimit } from "electron/main/Prompts/Prompts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReceiveCallback = (...args: any[]) => void;

declare global {
  interface Window {
    ipcRenderer: {
      on: (channel: string, listener: (...args: unknown[]) => void) => void;
      removeListener: (channel: string, listener: ReceiveCallback) => void;
      receive: (channel: string, callback: ReceiveCallback) => void;
    };
    electron: {
      openExternal: (url: string) => void;
      getPlatform: () => string;
      openNewWindow: () => void;
      destroyWindow: () => void;
    };
    contextMenu: {
      showFileItemContextMenu: (filePath: FileInfoNode) => void;
    };
    database: {
      search: (
        query: string,
        limit: number,
        filter?: string
      ) => Promise<DBQueryResult[]>;
      deleteLanceDBEntriesByFilePath: (filePath: string) => Promise<void>;
      indexFilesInDirectory: () => void;
      augmentPromptWithRAG: (
        prompt: string,
        llmSessionID: string,
        filter?: string
      ) => Promise<string>;
      getDatabaseFields: () => Promise<Record<string, string>>;
    };
    files: {
      openDirectoryDialog: () => Promise<string[]>;
      openFileDialog: (fileExtensions?: string[]) => Promise<string[]>;
      getFilesForWindow: () => Promise<FileInfoTree>;
      writeFile: (writeFileProps: WriteFileProps) => Promise<void>;
      indexFileInDatabase: (filePath: string) => Promise<void>;
      readFile: (filePath: string) => Promise<string>;
      deleteFile: (filePath: string) => Promise<void>;
      createFile: (filePath: string, content: string) => Promise<void>;
      createDirectory: (dirPath: string) => Promise<void>;
      joinPath: (...pathSegments: string[]) => Promise<string>;
      moveFileOrDir: (
        sourcePath: string,
        destinationPath: string
      ) => Promise<void>;
      augmentPromptWithFile: (
        augmentPromptWithFileProps: AugmentPromptWithFileProps
      ) => Promise<PromptWithContextLimit>;
    };
    path: {
      basename: (pathString: string) => string;
    };
    llm: {
      createSession: (sessionId: string) => Promise<string>;
      doesSessionExist: (sessionId: string) => Promise<boolean>;
      deleteSession: (sessionId: string) => Promise<string>;
      getOrCreateSession: (sessionId: string) => Promise<string>;
      initializeStreamingResponse: (
        sessionId: string,
        prompt: string,
        ignoreChatHistory?: boolean
      ) => Promise<string>;
    };
    electronStore: {
      setUserDirectory: (path: string) => Promise<void>;
      getUserDirectory: () => string;
      getLLMConfigs: () => Promise<Record<string, LLMModelConfig>>;
      updateLLMConfig: (
        modelName: string,
        modelConfig: LLMModelConfig
      ) => Promise<void>;
      addOrUpdateLLM: (
        modelName: string,
        modelConfig: LLMModelConfig
      ) => Promise<void>;
      deleteLocalLLM: (
        modelName: string,
        modelConfig: LLMModelConfig
      ) => Promise<void>;
      setDefaultLLM: (modelName: string) => void;
      getDefaultLLM: () => string;
      getDefaultEmbeddingModel: () => string;
      setDefaultEmbeddingModel: (repoName: string) => void;
      addNewLocalEmbeddingModel: (model: EmbeddingModelWithLocalPath) => void;
      addNewRepoEmbeddingModel: (model: EmbeddingModelWithRepo) => void;
      getEmbeddingModels: () => Record<string, EmbeddingModelConfig>;
      updateEmbeddingModel: (
        modelName: string,
        updatedModel: EmbeddingModelWithLocalPath | EmbeddingModelWithRepo
      ) => void;
      removeEmbeddingModel: (modelName: string) => void;
      getNoOfRAGExamples: () => number;
      setNoOfRAGExamples: (noOfExamples: number) => void;
      getHardwareConfig: () => HardwareConfig;
      setHardwareConfig: (config: HardwareConfig) => void;
      getLLMGenerationParams: () => LLMGenerationParameters;
      setLLMGenerationParams: (params: LLMGenerationParameters) => void;
    };
  }
}

contextBridge.exposeInMainWorld("database", {
  search: async (
    query: string,
    limit: number,
    filter?: string
  ): Promise<DBEntry[]> => {
    return ipcRenderer.invoke("search", query, limit, filter);
  },
  deleteLanceDBEntriesByFilePath: async (
    filePath: string,
  ): Promise<void> => {
    return ipcRenderer.invoke("delete-lance-db-entries-by-filepath", filePath);
  },
  indexFilesInDirectory: async () => {
    return ipcRenderer.send("index-files-in-directory");
  },
  augmentPromptWithRAG: async (
    prompt: string,
    llmSessionID: string,
    filter?: string
  ): Promise<DBEntry[]> => {
    return ipcRenderer.invoke(
      "augment-prompt-with-rag",
      prompt,
      llmSessionID,
      filter
    );
  },
  getDatabaseFields: async (): Promise<Record<string, string>> => {
    return ipcRenderer.invoke("get-database-fields");
  },
});

ipcRenderer.on('delete-file-listener', (event, filePath) => {
  console.log(`Received delete-file-listener event with file path: ${filePath}`);
});

contextBridge.exposeInMainWorld("electron", {
  openExternal: (url: string) => ipcRenderer.send("open-external", url),
  getPlatform: () => ipcRenderer.invoke("get-platform"),
  openNewWindow: () => ipcRenderer.send("open-new-window"),
  destroyWindow: () => ipcRenderer.send("destroy-window"),
});

contextBridge.exposeInMainWorld("electronStore", {
  setUserDirectory: (path: string) => {
    return ipcRenderer.sendSync("set-user-directory", path);
  },
  getUserDirectory: () => {
    return ipcRenderer.sendSync("get-user-directory");
  },
  getLLMConfigs: async (): Promise<LLMModelConfig[]> => {
    return ipcRenderer.invoke("get-llm-configs");
  },
  updateLLMConfig: async (modelName: string, modelConfig: LLMModelConfig) => {
    return ipcRenderer.invoke("update-llm-config", modelName, modelConfig);
  },
  addOrUpdateLLM: async (modelName: string, modelConfig: LLMModelConfig) => {
    return ipcRenderer.invoke("add-or-update-llm", modelName, modelConfig);
  },
  deleteLocalLLM: async (modelName: string, modelConfig: LLMModelConfig) => {
    return ipcRenderer.invoke("delete-local-llm", modelName, modelConfig);
  },
  setDefaultLLM: (modelName: string) => {
    ipcRenderer.send("set-default-llm", modelName);
  },

  getDefaultLLM: () => {
    return ipcRenderer.sendSync("get-default-llm");
  },

  getDefaultEmbeddingModel: () => {
    return ipcRenderer.sendSync("get-default-embedding-model");
  },
  setDefaultEmbeddingModel: (repoName: string) => {
    ipcRenderer.send("set-default-embedding-model", repoName);
  },

  addNewLocalEmbeddingModel: (model: EmbeddingModelWithLocalPath) => {
    ipcRenderer.send("add-new-local-embedding-model", model);
  },
  getEmbeddingModels: () => {
    return ipcRenderer.sendSync("get-embedding-models");
  },
  addNewRepoEmbeddingModel: (model: EmbeddingModelWithRepo) => {
    ipcRenderer.send("add-new-repo-embedding-model", model);
  },
  updateEmbeddingModel: (
    modelName: string,
    updatedModel: EmbeddingModelWithLocalPath | EmbeddingModelWithRepo
  ) => {
    ipcRenderer.send("update-embedding-model", modelName, updatedModel);
  },
  removeEmbeddingModel: (modelName: string) => {
    ipcRenderer.send("remove-embedding-model", modelName);
  },

  getNoOfRAGExamples: () => {
    return ipcRenderer.sendSync("get-no-of-rag-examples");
  },
  setNoOfRAGExamples: (noOfExamples: number) => {
    ipcRenderer.send("set-no-of-rag-examples", noOfExamples);
  },
  getHardwareConfig: () => {
    return ipcRenderer.sendSync("get-hardware-config");
  },
  setHardwareConfig: (config: HardwareConfig) => {
    ipcRenderer.send("set-hardware-config", config);
  },
  getLLMGenerationParams: () => {
    return ipcRenderer.sendSync("get-llm-generation-params");
  },
  setLLMGenerationParams: (params: LLMGenerationParameters) => {
    ipcRenderer.send("set-llm-generation-params", params);
  },
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  on: ipcRenderer.on,
  removeListener: ipcRenderer.removeListener,
  receive: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

contextBridge.exposeInMainWorld("contextMenu", {
  showFileItemContextMenu: (file: FileInfoNode) => {
    ipcRenderer.send("show-context-menu-file-item", file);
  },
});

contextBridge.exposeInMainWorld("files", {
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
  openFileDialog: (fileExtensions?: string[]) =>
    ipcRenderer.invoke("open-file-dialog", fileExtensions),
  getFilesForWindow: async (): Promise<FileInfoTree> => {
    return ipcRenderer.invoke("get-files-for-window");
  },

  writeFile: async (writeFileProps: WriteFileProps) => {
    return ipcRenderer.invoke("write-file", writeFileProps);
  },

  indexFileInDatabase: async (filePath: string) => {
    return ipcRenderer.invoke("index-file-in-database", filePath);
  },

  createFile: async (filePath: string, content: string) => {
    return ipcRenderer.invoke("create-file", filePath, content);
  },

  createDirectory: async (dirPath: string) => {
    return ipcRenderer.invoke("create-directory", dirPath);
  },

  readFile: async (filePath: string) => {
    return ipcRenderer.invoke("read-file", filePath);
  },
  deleteFile: (filePath: string) => {
    return ipcRenderer.invoke("delete-file", filePath);
  },
  joinPath: (...pathSegments: string[]) =>
    ipcRenderer.invoke("join-path", ...pathSegments),

  moveFileOrDir: async (sourcePath: string, destinationPath: string) => {
    return ipcRenderer.invoke("move-file-or-dir", sourcePath, destinationPath);
  },
  augmentPromptWithFile: async (
    augmentPromptWithFileProps: AugmentPromptWithFileProps
  ): Promise<PromptWithContextLimit> => {
    return ipcRenderer.invoke(
      "augment-prompt-with-file",
      augmentPromptWithFileProps
    );
  },
});

contextBridge.exposeInMainWorld("path", {
  basename: (pathString: string) =>
    ipcRenderer.invoke("path-basename", pathString),
});

contextBridge.exposeInMainWorld("llm", {
  createSession: async (sessionId: string) => {
    return await ipcRenderer.invoke("create-session", sessionId);
  },
  doesSessionExist: async (sessionId: string) => {
    return await ipcRenderer.invoke("does-session-exist", sessionId);
  },
  deleteSession: async (sessionId: string) => {
    return await ipcRenderer.invoke("delete-session", sessionId);
  },
  getOrCreateSession: async (sessionId: string) => {
    return await ipcRenderer.invoke("get-or-create-session", sessionId);
  },
  initializeStreamingResponse: async (
    sessionId: string,
    prompt: string,
    ignoreChatHistory?: boolean
  ) => {
    return await ipcRenderer.invoke(
      "initialize-streaming-response",
      sessionId,
      prompt,
      ignoreChatHistory
    );
  },
});
