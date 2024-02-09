import { contextBridge, ipcRenderer } from "electron";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import { FileInfoNode, FileInfoTree } from "electron/main/Files/Types";
import { DBEntry, DBQueryResult } from "electron/main/database/Schema";
// import { FileInfo } from "electron/main/Files/Types";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReceiveCallback = (...args: any[]) => void;

declare global {
  interface Window {
    ipcRenderer: {
      // send: (channel: string, ...args: any[]) => void;
      // sendSync: (channel: string, ...args: any[]) => any;
      on: (channel: string, listener: (...args: unknown[]) => void) => void;
      // once: (channel: string, listener: (...args: any[]) => void) => void;
      // invoke: (channel: string, ...args: any[]) => Promise<any>;
      removeListener: (channel: string, listener: ReceiveCallback) => void;
      // removeAllListeners: (channel: string) => void;
      receive: (channel: string, callback: ReceiveCallback) => void;
    };
    electron: {
      openExternal: (url: string) => void;
      getPlatform: () => string;
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
      getFiles: () => Promise<FileInfoTree>;
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
        prompt: string
      ) => Promise<string>;
    };
    electronStore: {
      setUserDirectory: (path: string) => Promise<void>;
      getUserDirectory: () => string;
      getAIModelConfigs: () => Promise<Record<string, AIModelConfig>>;
      updateAIModelConfig: (
        modelName: string,
        modelConfig: AIModelConfig
      ) => Promise<void>;
      setupNewLLM: (
        modelName: string,
        modelConfig: AIModelConfig
      ) => Promise<void>;
      setDefaultAIModel: (modelName: string) => void;
      getDefaultAIModel: () => string;
      getDefaultEmbedFuncRepo: () => string;
      setDefaultEmbedFuncRepo: (repoName: string) => void;
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
});

contextBridge.exposeInMainWorld("electronStore", {
  setUserDirectory: (path: string) => {
    return ipcRenderer.sendSync("set-user-directory", path);
  },
  getUserDirectory: () => {
    return ipcRenderer.sendSync("get-user-directory");
  },
  getAIModelConfigs: async (): Promise<AIModelConfig[]> => {
    return ipcRenderer.invoke("get-ai-model-configs");
  },
  updateAIModelConfig: async (
    modelName: string,
    modelConfig: AIModelConfig
  ) => {
    return ipcRenderer.invoke("update-ai-model-config", modelName, modelConfig);
  },
  setupNewLLM: async (modelName: string, modelConfig: AIModelConfig) => {
    return ipcRenderer.invoke("setup-new-model", modelName, modelConfig);
  },
  setDefaultAIModel: (modelName: string) => {
    ipcRenderer.send("set-default-ai-model", modelName);
  },

  getDefaultAIModel: () => {
    return ipcRenderer.sendSync("get-default-ai-model");
  },

  getDefaultEmbedFuncRepo: () => {
    return ipcRenderer.sendSync("get-default-embed-func-repo");
  },
  setDefaultEmbedFuncRepo: (repoName: string) => {
    ipcRenderer.send("set-default-embed-func-repo", repoName);
  },
  getNoOfRAGExamples: () => {
    return ipcRenderer.sendSync("get-no-of-rag-examples");
  },
  setNoOfRAGExamples: (noOfExamples: number) => {
    ipcRenderer.send("set-no-of-rag-examples", noOfExamples);
  },
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  // send: ipcRenderer.send,
  // sendSync: ipcRenderer.sendSync,
  on: ipcRenderer.on,
  // once: ipcRenderer.once,
  // invoke: ipcRenderer.invoke,
  removeListener: ipcRenderer.removeListener,
  // removeAllListeners: ipcRenderer.removeAllListeners,
  receive: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

contextBridge.exposeInMainWorld("contextMenu", {
  // Function to trigger the context menu
  showFileItemContextMenu: (file: FileInfoNode) => {
    ipcRenderer.send("show-context-menu-file-item", file);
  },

  // Function to set up a listener for menu actions
});

contextBridge.exposeInMainWorld("files", {
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
  openFileDialog: (fileExtensions?: string[]) =>
    ipcRenderer.invoke("open-file-dialog", fileExtensions),
  getFiles: async (): Promise<FileInfoTree> => {
    return ipcRenderer.invoke("get-files");
  },

  // Write content to a file
  writeFile: async (filePath: string, content: string) => {
    return ipcRenderer.invoke("write-file", filePath, content);
  },

  createFile: async (filePath: string, content: string) => {
    return ipcRenderer.invoke("create-file", filePath, content);
  },

  createDirectory: async (dirPath: string) => {
    return ipcRenderer.invoke("create-directory", dirPath);
  },

  // Read content from a file
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
  initializeStreamingResponse: async (sessionId: string, prompt: string) => {
    return await ipcRenderer.invoke(
      "initialize-streaming-response",
      sessionId,
      prompt
    );
  },
});
