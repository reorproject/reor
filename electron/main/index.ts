import * as fs from "fs/promises";
import { release } from "node:os";
import { join } from "node:path";
import * as path from "path";

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
  shell,
} from "electron";
import Store from "electron-store";
import * as lancedb from "vectordb";

import { errorToStringMainProcess } from "./common/error";
import { addExtensionToFilenameIfNoExtensionPresent } from "./common/path";
import { StoreKeys, StoreSchema } from "./electron-store/storeConfig";
import {
  getDefaultEmbeddingModelConfig,
  registerStoreHandlers,
} from "./electron-store/storeHandlers";
import {
  markdownExtensions,
  startWatchingDirectory,
  updateFileListForRenderer,
} from "./filesystem/Filesystem";
import { registerFileHandlers } from "./filesystem/registerFilesHandler";
import {
  ollamaService,
  registerLLMSessionHandlers,
} from "./llm/llmSessionHandlers";
import { registerDBSessionHandlers } from "./vectorDatabase/dbSessionHandlers";
import { RepopulateTableWithMissingItems } from "./vectorDatabase/TableHelperFunctions";
import WindowsManager from "./windowManager";

const store = new Store<StoreSchema>();
// store.clear(); // clear store for testing CAUTION: THIS WILL DELETE YOUR CHAT HISTORY
const windowsManager = new WindowsManager();

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
console.log("process.env.DIST", process.env.DIST);
const indexHtml = join(process.env.DIST, "index.html");

let dbConnection: lancedb.Connection;

app.whenReady().then(async () => {
  try {
    await ollamaService.init();
  } catch (error) {
    windowsManager.appendNewErrorToDisplayInWindow(
      errorToStringMainProcess(error)
    );
  }
  windowsManager.createWindow(store, preload, url, indexHtml);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async () => {
  ollamaService.stop();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    windowsManager.createWindow(store, preload, url, indexHtml);
  }
});

registerLLMSessionHandlers(store);
registerDBSessionHandlers(store, windowsManager);
registerStoreHandlers(store, windowsManager);
registerFileHandlers(store, windowsManager);

ipcMain.handle("open-directory-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (!result.canceled) {
    return result.filePaths;
  } else {
    return null;
  }
});

ipcMain.handle("open-file-dialog", async (event, extensions) => {
  const filters =
    extensions && extensions.length > 0 ? [{ name: "Files", extensions }] : [];

  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections", "showHiddenFiles"], // Add 'showHiddenFiles' here
    filters: filters,
  });

  if (!result.canceled) {
    return result.filePaths;
  } else {
    return [];
  }
});

ipcMain.handle("index-files-in-directory", async (event) => {
  try {
    console.log("Indexing files in directory");
    const windowInfo = windowsManager.getWindowInfoForContents(event.sender);
    if (!windowInfo) {
      throw new Error("No window info found");
    }
    const defaultEmbeddingModelConfig = getDefaultEmbeddingModelConfig(store);
    const dbPath = path.join(app.getPath("userData"), "vectordb");
    dbConnection = await lancedb.connect(dbPath);

    await windowInfo.dbTableClient.initialize(
      dbConnection,
      windowInfo.vaultDirectoryForWindow,
      defaultEmbeddingModelConfig
    );
    await RepopulateTableWithMissingItems(
      windowInfo.dbTableClient,
      windowInfo.vaultDirectoryForWindow,
      (progress) => {
        event.sender.send("indexing-progress", progress);
      }
    );
    const win = BrowserWindow.fromWebContents(event.sender);

    if (win) {
      windowsManager.watcher = startWatchingDirectory(
        win,
        windowInfo.vaultDirectoryForWindow
      );
      updateFileListForRenderer(win, windowInfo.vaultDirectoryForWindow);
    }
    event.sender.send("indexing-progress", 1);
  } catch (error) {
    let errorStr = "";

    if (errorToStringMainProcess(error).includes("Embedding function error")) {
      errorStr = `${error}. Please try downloading an embedding model from Hugging Face and attaching it in settings. More information can be found in settings.`;
    } else {
      errorStr = `${error}. Please try restarting or open a Github issue.`;
    }
    event.sender.send("error-to-display-in-window", errorStr);
    console.error("Error during file indexing:", error);
  }
});

ipcMain.handle("show-context-menu-item", (event) => {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: "New Note",
      click: () => {
        event.sender.send("add-new-note-listener");
      },
    })
  );

  menu.append(
    new MenuItem({
      label: "New Directory",
      click: () => {
        event.sender.send("add-new-directory-listener");
      },
    })
  );

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) menu.popup({ window: browserWindow });
});

ipcMain.handle("show-context-menu-file-item", async (event, file) => {
  const menu = new Menu();

  const stats = await fs.stat(file.path);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    menu.append(
      new MenuItem({
        label: "New Note",
        click: () => {
          event.sender.send("add-new-note-listener", file.relativePath);
        },
      })
    );

    menu.append(
      new MenuItem({
        label: "New Directory",
        click: () => {
          event.sender.send("add-new-directory-listener", file.path);
        },
      })
    );
  }

  menu.append(
    new MenuItem({
      label: "Delete",
      click: () => {
        return dialog
          .showMessageBox({
            type: "question",
            title: "Delete File",
            message: `Are you sure you want to delete "${file.name}"?`,
            buttons: ["Yes", "No"],
          })
          .then((confirm) => {
            if (confirm.response === 0) {
              console.log(file.path);
              event.sender.send("delete-file-listener", file.path);
            }
          });
      },
    })
  );
  menu.append(
    new MenuItem({
      label: "Rename",
      click: () => {
        console.log(file.path);
        event.sender.send("rename-file-listener", file.path);
      },
    })
  );

  menu.append(
    new MenuItem({
      label: "Create a flashcard set",
      click: () => {
        console.log("creating: ", file.path);
        event.sender.send("create-flashcard-file-listener", file.path);
      },
    })
  );

  menu.append(
    new MenuItem({
      label: "Add file to chat context",
      click: () => {
        console.log("creating: ", file.path);
        event.sender.send("add-file-to-chat-listener", file.path);
      },
    })
  );

  console.log("menu key: ", file);

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) {
    menu.popup({ window: browserWindow });
  }
});

ipcMain.handle("show-chat-menu-item", (event, chatID) => {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: "Delete Chat",
      click: () => {
        const vaultDir = windowsManager.getVaultDirectoryForWinContents(
          event.sender
        );

        if (!vaultDir) {
          return;
        }

        const chatHistoriesMap = store.get(StoreKeys.ChatHistories);
        const allChatHistories = chatHistoriesMap[vaultDir] || [];
        const filteredChatHistories = allChatHistories.filter(
          (item) => item.id !== chatID
        );
        chatHistoriesMap[vaultDir] = filteredChatHistories;
        store.set(StoreKeys.ChatHistories, chatHistoriesMap);
        event.sender.send(
          "update-chat-histories",
          chatHistoriesMap[vaultDir] || []
        );
      },
    })
  );

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) menu.popup({ window: browserWindow });
});

ipcMain.handle("open-external", (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle("get-platform", async () => {
  return process.platform;
});

ipcMain.handle("open-new-window", () => {
  windowsManager.createWindow(store, preload, url, indexHtml);
});

ipcMain.handle("get-reor-app-version", async () => {
  return app.getVersion();
});

ipcMain.handle("path-basename", (event, pathString: string) => {
  return path.basename(pathString);
});

ipcMain.handle("path-sep", () => {
  return path.sep;
});

ipcMain.handle("join-path", (event, ...args) => {
  return path.join(...args);
});

ipcMain.handle("path-dirname", (event, pathString: string) => {
  return path.dirname(pathString) + path.sep;
});

ipcMain.handle("path-relative", (event, from: string, to: string) => {
  return path.relative(from, to);
});

ipcMain.handle(
  "add-extension-if-no-extension-present",
  (event, pathString: string) => {
    return addExtensionToFilenameIfNoExtensionPresent(
      pathString,
      markdownExtensions,
      ".md"
    );
  }
);
