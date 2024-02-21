import { contextBridge, ipcRenderer } from "electron";
import { LLMModelConfig } from "electron/main/Store/storeConfig";
import { FileInfoNode, FileInfoTree } from "electron/main/Files/Types";
import { DBEntry, DBQueryResult } from "electron/main/database/Schema";
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
        llmSessionID: string,
        filter?: string
      ) => Promise<string>;
      getDatabaseFields: () => Promise<Record<string, string>>;
    };
    files: {
      openDirectoryDialog: () => Promise<string[]>;
      openFileDialog: (fileExtensions?: string[]) => Promise<string[]>;
      getFilesForWindow: () => Promise<FileInfoTree>;
      writeFile: (filePath: string, content: string) => Promise<void>;
      readFile: (filePath: string) => Promise<string>;
      createFile: (filePath: string, content: string) => Promise<void>;
      createDirectory: (dirPath: string) => Promise<void>;
      joinPath: (...pathSegments: string[]) => Promise<string>;
      moveFileOrDir: (
        sourcePath: string,
        destinationPath: string
      ) => Promise<void>;
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
      setupNewLLM: (
        modelName: string,
        modelConfig: LLMModelConfig
      ) => Promise<void>;
      setDefaultLLM: (modelName: string) => void;
      getDefaultLLM: () => string;
      getDefaultEmbeddingModel: () => string;
      setDefaultEmbeddingModel: (repoName: string) => void;
      getNoOfRAGExamples: () => number;
      setNoOfRAGExamples: (noOfExamples: number) => void;
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
  getLLMConfigs: async (): Promise<LLMModelConfig[]> => {
    return ipcRenderer.invoke("get-llm-configs");
  },
  updateLLMConfig: async (modelName: string, modelConfig: LLMModelConfig) => {
    return ipcRenderer.invoke("update-llm-config", modelName, modelConfig);
  },
  setupNewLLM: async (modelName: string, modelConfig: LLMModelConfig) => {
    return ipcRenderer.invoke("setup-new-model", modelName, modelConfig);
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
  getNoOfRAGExamples: () => {
    return ipcRenderer.sendSync("get-no-of-rag-examples");
  },
  setNoOfRAGExamples: (noOfExamples: number) => {
    ipcRenderer.send("set-no-of-rag-examples", noOfExamples);
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

  writeFile: async (filePath: string, content: string) => {
    return ipcRenderer.invoke("write-file", filePath, content);
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
