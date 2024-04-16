import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Menu,
  MenuItem,
} from "electron";
import { release } from "node:os";
import { join } from "node:path";
import Store from "electron-store";
import * as path from "path";
import { StoreSchema } from "./Store/storeConfig";
// import contextMenus from "./contextMenus";
import * as lancedb from "vectordb";
import {
  markdownExtensions,
  startWatchingDirectory,
  updateFileListForRenderer,
} from "./Files/Filesystem";
import {
  ollamaService,
  registerLLMSessionHandlers,
} from "./llm/llmSessionHandlers";
// import { FileInfoNode } from "./Files/Types";
import { registerDBSessionHandlers } from "./database/dbSessionHandlers";
import {
  getDefaultEmbeddingModelConfig,
  registerStoreHandlers,
} from "./Store/storeHandlers";
import { registerFileHandlers } from "./Files/registerFilesHandler";
import { RepopulateTableWithMissingItems } from "./database/TableHelperFunctions";
import WindowsManager from "./windowManager";
import { errorToString } from "./Generic/error";
import { addExtensionToFilenameIfNoExtensionPresent } from "./Generic/path";

const store = new Store<StoreSchema>();
// store.clear(); // clear store for testing
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
    windowsManager.appendNewErrorToDisplayInWindow(errorToString(error));
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

    if (errorToString(error).includes("Embedding function error")) {
      errorStr = `${error}. Please try downloading an embedding model from Hugging Face and attaching it in settings. More information can be found in settings.`;
    } else {
      errorStr = `${error}. Please try restarting or open a Github issue.`;
    }
    event.sender.send("error-to-display-in-window", errorStr);
    console.error("Error during file indexing:", error);
  }
});

ipcMain.handle("show-context-menu-file-item", (event, file) => {
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Delete",
      click: () => {
        console.log(file.path);
        event.sender.send("delete-file-listener", file.path);
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

  console.log("menu key: ", file);

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) {
    menu.popup({ window: browserWindow });
  }
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
