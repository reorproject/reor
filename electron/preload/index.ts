import { contextBridge, ipcRenderer } from "electron";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import { FileInfoNode, FileInfoTree } from "electron/main/Files/Types";
// import { FileInfo } from "electron/main/Files/Types";
import { DBEntry } from "electron/main/database/Table";
type ReceiveCallback = (...args: any[]) => void;

declare global {
  interface Window {
    ipcRenderer: {
      // send: (channel: string, ...args: any[]) => void;
      // sendSync: (channel: string, ...args: any[]) => any;
      on: (channel: string, listener: (...args: any[]) => void) => void;
      // once: (channel: string, listener: (...args: any[]) => void) => void;
      // invoke: (channel: string, ...args: any[]) => Promise<any>;
      removeListener: (
        channel: string,
        listener: (...args: any[]) => void
      ) => void;
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
      ) => Promise<DBEntry[]>;
      indexFilesInDirectory: (directoryPath: string) => any;
      augmentPromptWithRAG: (
        prompt: string,
        numberOfContextItems: number,
        filter?: string
      ) => Promise<string>;
    };
    files: {
      openDirectoryDialog: () => Promise<string[]>;
      openFileDialog: (fileExtensions?: string[]) => Promise<string[]>;
      getFiles: () => Promise<FileInfoTree>;
      writeFile: (filePath: string, content: string) => Promise<any>;
      readFile: (filePath: string) => Promise<any>;
      createFile: (filePath: string, content: string) => Promise<any>;
      joinPath: (...pathSegments: string[]) => Promise<string>;
      moveFileOrDir: (
        sourcePath: string,
        destinationPath: string
      ) => Promise<any>;
    };
    llm: {
      createSession: (sessionId: any) => Promise<any>;
      doesSessionExist: (sessionId: any) => Promise<any>;
      deleteSession: (sessionId: any) => Promise<any>;
      getOrCreateSession: (sessionId: any) => Promise<any>;
      initializeStreamingResponse: (
        sessionId: any,
        prompt: string
      ) => Promise<any>;
    };
    electronStore: {
      setUserDirectory: (path: string) => any;
      getUserDirectory: () => string;
      setOpenAIAPIKey: (apiKey: string) => any;
      getOpenAIAPIKey: () => string;
      getAIModelConfigs: () => Promise<Record<string, AIModelConfig>>;
      setupNewLocalLLM: (modelConfig: AIModelConfig) => Promise<any>;
      setDefaultAIModel: (modelName: string) => any;
      getDefaultAIModel: () => Promise<string>;
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
  indexFilesInDirectory: async (directoryPath: string) => {
    return ipcRenderer.send("index-files-in-directory", directoryPath);
  },
  augmentPromptWithRAG: async (
    prompt: string,
    numberOfContextItems: number,
    filter?: string
  ): Promise<DBEntry[]> => {
    return ipcRenderer.invoke(
      "augment-prompt-with-rag",
      prompt,
      numberOfContextItems,
      filter
    );
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
  setOpenAIAPIKey: (apiKey: string) => {
    return ipcRenderer.sendSync("set-openai-api-key", apiKey);
  },
  getOpenAIAPIKey: () => {
    return ipcRenderer.sendSync("get-openai-api-key");
  },
  getUserDirectory: () => {
    return ipcRenderer.sendSync("get-user-directory");
  },
  getAIModelConfigs: async (): Promise<AIModelConfig[]> => {
    return ipcRenderer.invoke("get-ai-model-configs");
  },
  setupNewLocalLLM: async (modelConfig: AIModelConfig) => {
    return ipcRenderer.invoke("setup-new-local-model", modelConfig);
  },
  setDefaultAIModel: (modelName: string) => {
    ipcRenderer.send("set-default-ai-model", modelName);
  },

  getDefaultAIModel: async () => {
    return ipcRenderer.invoke("get-default-ai-model");
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
  receive: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

contextBridge.exposeInMainWorld("electronAPI", {
  openContextMenu: (menuTemplate: any) =>
    ipcRenderer.invoke("open-context-menu", menuTemplate),
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

contextBridge.exposeInMainWorld("llm", {
  createSession: async (sessionId: any) => {
    return await ipcRenderer.invoke("create-session", sessionId);
  },
  doesSessionExist: async (sessionId: any) => {
    return await ipcRenderer.invoke("does-session-exist", sessionId);
  },
  deleteSession: async (sessionId: any) => {
    return await ipcRenderer.invoke("delete-session", sessionId);
  },
  getOrCreateSession: async (sessionId: any) => {
    return await ipcRenderer.invoke("get-or-create-session", sessionId);
  },
  initializeStreamingResponse: async (sessionId: any, prompt: string) => {
    return await ipcRenderer.invoke(
      "initialize-streaming-response",
      sessionId,
      prompt
    );
  },
});
