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
import { update } from "./update";
import Store from "electron-store";
import * as path from "path";
import { StoreKeys, StoreSchema } from "./Store/storeConfig";
import * as lancedb from "vectordb";
import * as fs from "fs";
import { LanceDBTableWrapper } from "./database/LanceTableWrapper";
import { FSWatcher } from "fs";
import {
  startWatchingDirectory,
  updateFileListForRenderer,
} from "./Files/Filesystem";
import { registerLLMSessionHandlers } from "./llm/llmSessionHandlers";
import { registerDBSessionHandlers } from "./database/dbSessionHandlers";
import { registerStoreHandlers } from "./Store/storeHandlers";
import { registerFileHandlers } from "./Files/registerFilesHandler";
import { repopulateTableWithMissingItems } from "./database/TableHelperFunctions";

const store = new Store<StoreSchema>();
// store.clear();

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

interface WindowInfo {
  window: BrowserWindow;
  vaultDirectory: string;
}

const windows = new Map<number, WindowInfo>();

const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

let dbConnection: lancedb.Connection;
const dbTable = new LanceDBTableWrapper();
const fileWatcher: FSWatcher | null = null;

async function createWindow(windowVaultDirectory: string) {
  const newWin = new BrowserWindow({
    title: "Main window",
    // icon: join(process.env.VITE_PUBLIC, "favicon.ico"), // oh we could also try just setting this to .ico
    webPreferences: {
      preload,
    },
    frame: false,
    titleBarStyle: "hidden", // or 'customButtonsOnHover'
    titleBarOverlay: {
      color: "#2f3241",
      symbolColor: "#74b1be",
      height: 30, // Adjust height as necessary to fit your icons
    },
    width: 1200,
    height: 800,
  });

  const winId = newWin.id;
  windows.set(winId, { window: newWin, vaultDirectory: windowVaultDirectory });

  if (url) {
    // electron-vite-vue#298
    newWin.loadURL(url);
    // Open devTool if the app is not packaged
    newWin.webContents.openDevTools();
  } else {
    newWin.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  newWin.webContents.on("did-finish-load", () => {
    newWin?.webContents.send("window-vault-directory", windowVaultDirectory);
  });

  // Make all links open with the browser, not with the application
  newWin.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(newWin);
  registerLLMSessionHandlers(store);
  registerDBSessionHandlers(dbTable, store);
  registerStoreHandlers(store, fileWatcher);
  registerFileHandlers(store, dbTable, newWin);
}

app.whenReady().then(async () => {
  const userDirectory = store.get(StoreKeys.UserDirectory) as string;
  createWindow(userDirectory);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    const userDirectory = store.get(StoreKeys.UserDirectory) as string;
    createWindow(userDirectory);
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

// ipcMain.on("request-window-vault-directory", (event) => {
//   const webContents = event.sender;
//   const win = BrowserWindow.fromWebContents(webContents);
//   if (win) {
//     const directory = windowIDToVaultDirectory.get(win.id);
//     event.reply("response-window-vault-directory", directory);
//   }
// });
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
    const senderWindowId = event.sender.id;

    // Retrieve the corresponding BrowserWindow instance
    const targetWindow = windows.get(senderWindowId);
    if (!targetWindow) {
      throw new Error("No window found for the sender of the event");
    }
    // const userDirectory = store.get(StoreKeys.UserDirectory) as string;
    // if (!userDirectory) {
    //   throw new Error("No user directory set");
    // }
    const embedFuncRepoName = store.get(
      StoreKeys.DefaultEmbedFuncRepo
    ) as string;
    if (!embedFuncRepoName) {
      throw new Error("No default embed func repo set");
    }
    const dbPath = path.join(app.getPath("userData"), "vectordb");
    console.log("dbPath: ", dbPath);
    dbConnection = await lancedb.connect(dbPath);
    console.log("dbConnection: ", dbConnection);
    await dbTable.initialize(
      dbConnection,
      targetWindow?.vaultDirectory,
      embedFuncRepoName
    );
    console.log("initialized: ", dbTable);
    await repopulateTableWithMissingItems(
      dbTable,
      targetWindow?.vaultDirectory,
      (progress) => {
        event.sender.send("indexing-progress", progress);
      }
    );
    console.log("repopulated: ", dbTable);
    if (targetWindow?.window) {
      startWatchingDirectory(targetWindow.window, targetWindow?.vaultDirectory);
      updateFileListForRenderer(
        targetWindow.window,
        targetWindow?.vaultDirectory
      );
    }
    event.sender.send("indexing-progress", 1);
  } catch (error) {
    const nonLinuxError = `Indexing error: ${error}. Please try restarting or send me an email with your error: samlhuillier1@gmail.com`;
    event.sender.send("indexing-error", nonLinuxError);
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
        fs.stat(file.path, (err, stats) => {
          if (err) {
            console.error("An error occurred:", err);
            return;
          }

          if (stats.isDirectory()) {
            // For directories (Node.js v14.14.0 and later)
            fs.rm(file.path, { recursive: true }, (err) => {
              if (err) {
                console.error("An error occurred:", err);
                return;
              }
              console.log(
                `Directory at ${file.path} was deleted successfully.`
              );
            });
          } else {
            // For files
            fs.unlink(file.path, (err) => {
              if (err) {
                console.error("An error occurred:", err);
                return;
              }
              console.log(`File at ${file.path} was deleted successfully.`);
            });
          }
        });
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

ipcMain.handle("path-basename", (event, pathString: string) => {
  return path.basename(pathString);
});
