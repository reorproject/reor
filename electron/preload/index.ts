import { contextBridge, ipcRenderer } from "electron";
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  HardwareConfig,
  LLMGenerationParameters,
  LLMConfig,
} from "electron/main/Store/storeConfig";
import {
  AugmentPromptWithFileProps,
  FileInfoNode,
  FileInfoTree,
  WriteFileProps,
} from "electron/main/Files/Types";
import { DBEntry, DBQueryResult } from "electron/main/database/Schema";
import { PromptWithContextLimit } from "electron/main/Prompts/Prompts";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
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
      indexFilesInDirectory: () => void;
      augmentPromptWithRAG: (
        prompt: string,
        llmName: string,
        filter?: string
      ) => Promise<string>;
      augmentPromptWithTemporalAgent: (
        prompt: string,
        llmName: string
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
      streamingLLMResponse: (
        llmName: string,
        llmConfig: LLMConfig,
        messageHistory: ChatCompletionMessageParam[]
      ) => Promise<string>;
      getLLMConfigs: () => Promise<LLMConfig[]>;
      getLLMConfigByName: (modelName: string) => LLMConfig;
      pullOllamaModel: (modelName: string) => Promise<void>;
      addOrUpdateLLM: (modelConfig: LLMConfig) => Promise<void>;
      removeLLM: (modelNameToDelete: string) => Promise<void>;
      setDefaultLLM: (modelName: string) => void;
      getDefaultLLMName: () => string;
    };
    electronStore: {
      setUserDirectory: (path: string) => Promise<void>;
      getUserDirectory: () => string;
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
  indexFilesInDirectory: async () => {
    return ipcRenderer.send("index-files-in-directory");
  },
  augmentPromptWithRAG: async (
    prompt: string,
    llmName: string,
    filter?: string
  ): Promise<DBEntry[]> => {
    return ipcRenderer.invoke(
      "augment-prompt-with-rag",
      prompt,
      llmName,
      filter
    );
  },
  augmentPromptWithTemporalAgent: async (
    prompt: string,
    llmName: string
  ): Promise<DBEntry[]> => {
    return ipcRenderer.invoke(
      "augment-prompt-with-temporal-agent",
      prompt,
      llmName
    );
  },
  getDatabaseFields: async (): Promise<Record<string, string>> => {
    return ipcRenderer.invoke("get-database-fields");
  },
});

contextBridge.exposeInMainWorld("electron", {
  openExternal: (url: string) => ipcRenderer.send("open-external", url),
  getPlatform: () => ipcRenderer.invoke("get-platform"),
  openNewWindow: () => ipcRenderer.send("open-new-window"),
});

contextBridge.exposeInMainWorld("electronStore", {
  setUserDirectory: (path: string) => {
    return ipcRenderer.sendSync("set-user-directory", path);
  },
  getUserDirectory: () => {
    return ipcRenderer.sendSync("get-user-directory");
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
  streamingLLMResponse: async (
    llmName: string,
    llmConfig: LLMConfig,
    messageHistory: ChatCompletionMessageParam[]
  ) => {
    return await ipcRenderer.invoke(
      "streaming-llm-response",
      llmName,
      llmConfig,
      messageHistory
    );
  },

  getLLMConfigs: async (): Promise<LLMConfig[]> => {
    return ipcRenderer.invoke("get-llm-configs");
  },
  getLLMConfigByName: (modelName: string) => {
    return ipcRenderer.sendSync("get-llm-config-by-name", modelName);
  },

  pullOllamaModel: async (modelName: string) => {
    return await ipcRenderer.invoke("pull-ollama-model", modelName);
  },
  addOrUpdateLLM: async (modelConfig: LLMConfig) => {
    return ipcRenderer.invoke("add-or-update-llm", modelConfig);
  },
  removeLLM: async (modelNameToDelete: string) => {
    return await ipcRenderer.invoke("remove-llm", modelNameToDelete);
  },
  setDefaultLLM: (modelName: string) => {
    ipcRenderer.send("set-default-llm", modelName);
  },

  getDefaultLLMName: () => {
    return ipcRenderer.sendSync("get-default-llm-name");
  },
});
