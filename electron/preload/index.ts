import { contextBridge, ipcRenderer } from "electron";
type ReceiveCallback = (...args: any[]) => void;

declare global {
  interface Window {
    ipcRenderer: {
      // send: (channel: string, ...args: any[]) => void;
      // sendSync: (channel: string, ...args: any[]) => any;
      // on: (channel: string, listener: (...args: any[]) => void) => void;
      // once: (channel: string, listener: (...args: any[]) => void) => void;
      // invoke: (channel: string, ...args: any[]) => Promise<any>;
      removeListener: (
        channel: string,
        listener: (...args: any[]) => void
      ) => void;
      // removeAllListeners: (channel: string) => void;
      receive: (channel: string, callback: ReceiveCallback) => void;
    };
    files: {
      getFiles: () => Promise<any>;
      writeFile: (filePath: string, content: string) => Promise<any>;
      readFile: (filePath: string) => Promise<any>;
    };
    llm: {
      createSession: (sessionId: any) => Promise<any>;
      getHello: (sessionId: any) => Promise<any>;
      initializeStreamingResponse: (
        sessionId: any,
        prompt: string
      ) => Promise<any>;
    };
    electronStore: {
      setUserDirectory: (path: string) => any;
      getUserDirectory: () => any;
    };
  }
}

contextBridge.exposeInMainWorld("electronStore", {
  setUserDirectory: (path: string) => {
    return ipcRenderer.sendSync("set-user-directory", path);
  },
  getUserDirectory: () => {
    return ipcRenderer.sendSync("get-user-directory");
  },
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  // send: ipcRenderer.send,
  // sendSync: ipcRenderer.sendSync,
  // on: ipcRenderer.on,
  // once: ipcRenderer.once,
  // invoke: ipcRenderer.invoke,
  removeListener: ipcRenderer.removeListener,
  // removeAllListeners: ipcRenderer.removeAllListeners,
  receive: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

contextBridge.exposeInMainWorld("files", {
  getFiles: async () => {
    // No need to pass a channel name as a string literal every time, which can be error-prone
    return ipcRenderer.invoke("get-files");
  },

  // Write content to a file
  writeFile: async (filePath: string, content: string) => {
    return ipcRenderer.invoke("write-file", filePath, content);
  },

  // Read content from a file
  readFile: async (filePath: string) => {
    return ipcRenderer.invoke("read-file", filePath);
  },
});

contextBridge.exposeInMainWorld("llm", {
  createSession: async (sessionId: any) => {
    return await ipcRenderer.invoke("createSession", sessionId);
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
