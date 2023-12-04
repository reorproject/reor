import { contextBridge, ipcRenderer } from "electron";
import { AIModelConfig } from "electron/main/Config/storeConfig";
import { FileInfoTree } from "electron/main/Files/Types";
// import { FileInfo } from "electron/main/Files/Types";
import { RagnoteDBEntry } from "electron/main/database/Table";
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
    database: {
      search: (
        query: string,
        limit: number,
        filter?: string
      ) => Promise<RagnoteDBEntry[]>;
      indexFilesInDirectory: (directoryPath: string) => any;
      augmentPromptWithRAG: (
        prompt: string,
        limit: number,
        filter?: string
      ) => Promise<string>;
    };
    files: {
      openDirectoryDialog: () => Promise<any>;
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
      // createSession: (sessionId: any) => Promise<any>;
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
      setupAIModel: (
        modelName: string,
        modelConfig: AIModelConfig
      ) => Promise<any>;
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
  ): Promise<RagnoteDBEntry[]> => {
    return ipcRenderer.invoke("search", query, limit, filter);
  },
  indexFilesInDirectory: async (directoryPath: string) => {
    return ipcRenderer.send("index-files-in-directory", directoryPath);
  },
  augmentPromptWithRAG: async (
    prompt: string,
    limit: number,
    filter?: string
  ): Promise<RagnoteDBEntry[]> => {
    return ipcRenderer.invoke("augment-prompt-with-rag", prompt, limit, filter);
  },
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
  setupAIModel: async (modelName: string, modelConfig: AIModelConfig) => {
    return ipcRenderer.invoke("setup-new-model", modelName, modelConfig);
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

contextBridge.exposeInMainWorld("files", {
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
  getFiles: async (): Promise<FileInfoTree> => {
    // No need to pass a channel name as a string literal every time, which can be error-prone
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
  // createSession: async (sessionId: any) => {
  //   return await ipcRenderer.invoke("createSession", sessionId);
  // },
  getOrCreateSession: async (sessionId: any) => {
    return await ipcRenderer.invoke("getOrCreateSession", sessionId);
  },
  getHello: async (sessionId: any) => {
    return await ipcRenderer.invoke("getHello", sessionId);
  },
  initializeStreamingResponse: async (sessionId: any, prompt: string) => {
    return await ipcRenderer.invoke(
      "initializeStreamingResponse",
      sessionId,
      prompt
    );
  },
});

// function domReady(
//   condition: DocumentReadyState[] = ["complete", "interactive"]
// ) {
//   return new Promise((resolve) => {
//     if (condition.includes(document.readyState)) {
//       resolve(true);
//     } else {
//       document.addEventListener("readystatechange", () => {
//         if (condition.includes(document.readyState)) {
//           resolve(true);
//         }
//       });
//     }
//   });
// }

// const safeDOM = {
//   append(parent: HTMLElement, child: HTMLElement) {
//     if (!Array.from(parent.children).find((e) => e === child)) {
//       return parent.appendChild(child);
//     }
//   },
//   remove(parent: HTMLElement, child: HTMLElement) {
//     if (Array.from(parent.children).find((e) => e === child)) {
//       return parent.removeChild(child);
//     }
//   },
// };

// /**
//  * https://tobiasahlin.com/spinkit
//  * https://connoratherton.com/loaders
//  * https://projects.lukehaas.me/css-loaders
//  * https://matejkustec.github.io/SpinThatShit
//  */
// function useLoading() {
//   const className = `loaders-css__square-spin`;
//   const styleContent = `
// @keyframes square-spin {
//   25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
//   50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
//   75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
//   100% { transform: perspective(100px) rotateX(0) rotateY(0); }
// }
// .${className} > div {
//   animation-fill-mode: both;
//   width: 50px;
//   height: 50px;
//   background: #fff;
//   animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
// }
// .app-loading-wrap {
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100vw;
//   height: 100vh;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background: #282c34;
//   z-index: 9;
// }
//     `;
//   const oStyle = document.createElement("style");
//   const oDiv = document.createElement("div");

//   oStyle.id = "app-loading-style";
//   oStyle.innerHTML = styleContent;
//   oDiv.className = "app-loading-wrap";
//   oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

//   return {
//     appendLoading() {
//       safeDOM.append(document.head, oStyle);
//       safeDOM.append(document.body, oDiv);
//     },
//     removeLoading() {
//       safeDOM.remove(document.head, oStyle);
//       safeDOM.remove(document.body, oDiv);
//     },
//   };
// }

// // ----------------------------------------------------------------------

// const { appendLoading, removeLoading } = useLoading();
// domReady().then(appendLoading);

// window.onmessage = (ev) => {
//   ev.data.payload === "removeLoading" && removeLoading();
// };

// setTimeout(removeLoading, 4999);
