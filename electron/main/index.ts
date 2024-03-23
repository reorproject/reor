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
const indexHtml = join(process.env.DIST, "index.html");

let dbConnection: lancedb.Connection;

async function createWindow() {
  const { x, y } = windowsManager.getNextWindowPosition();
  const { width, height } = windowsManager.getWindowSize();

  const win = new BrowserWindow({
    title: "Reor",
    x: x,
    y: y,
    webPreferences: {
      preload,
    },
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#303030",
      symbolColor: "#fff",
      height: 30,
    },
    width: width,
    height: height,
  });

  if (url) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.on("close", () => {
    win.webContents.send("prepare-for-window-close");

    windowsManager.prepareWindowForClose(store, win);
  });

  win.webContents.on("did-finish-load", () => {
    const errorsToSendWindow = windowsManager.getAndClearErrorStrings();
    errorsToSendWindow.forEach((errorStrToSendWindow) => {
      win.webContents.send("error-to-display-in-window", errorStrToSendWindow);
    });
  });
}

app.whenReady().then(async () => {
  try {
    await ollamaService.init();
  } catch (error) {
    windowsManager.appendNewErrorToDisplayInWindow(errorToString(error));
  }
  createWindow();
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
    createWindow();
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

ipcMain.on("index-files-in-directory", async (event) => {
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
      startWatchingDirectory(win, windowInfo.vaultDirectoryForWindow);
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

ipcMain.on("show-context-menu-file-item", (event, file) => {
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

  console.log("menu key: ", file);

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) {
    menu.popup({ window: browserWindow });
  }
});

ipcMain.on("open-external", (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle("get-platform", async () => {
  return process.platform;
});

ipcMain.on("open-new-window", () => {
  createWindow();
});

ipcMain.handle("path-basename", (event, pathString: string) => {
  return path.basename(pathString);
});
