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
import { AIModelConfig, StoreKeys, StoreSchema } from "./Store/storeConfig";
// import contextMenus from "./contextMenus";
import * as lancedb from "vectordb";
import * as fs from "fs";
import {
  RagnoteTable,
  repopulateTableWithMissingItems,
} from "./database/Table";
import { FSWatcher } from "fs";
import {
  GetFilesInfoTree,
  markdownExtensions,
  orchestrateEntryMove,
  startWatchingDirectory,
  updateFileListForRenderer,
  writeFileSyncRecursive,
} from "./Files/Filesystem";
import { registerLLMSessionHandlers } from "./llm/llmSessionHandlers";
import { FileInfoNode, FileInfoTree } from "./Files/Types";
import { registerDBSessionHandlers } from "./database/dbSessionHandlers";
import { validateAIModelConfig } from "./llm/llmConfig";
import { registerStoreHandlers } from "./Store/storeHandlers";
import { registerFileHandlers } from "./Files/registerFilesHandler";
// import {  } from "electron/main";

const store = new Store<StoreSchema>();
// const user = store.get("user");
// store.clear();

// Check if 'user' and 'directory' exist before attempting to delete
// if (user && typeof user === "object" && "directory" in user) {
//   // Delete the 'directory' property
//   delete user.directory;

//   // Save the updated 'user' object back to the store
//   store.set("user", user);
// }

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

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

let dbConnection: lancedb.Connection;
let dbTable = new RagnoteTable();
let fileWatcher: FSWatcher | null = null;

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // nodeIntegration: true,
      // contextIsolation: false,
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

  if (url) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
    const userDirectory = store.get(StoreKeys.UserDirectory) as string;
    const files = GetFilesInfoTree(userDirectory, markdownExtensions);
    win?.webContents.send("files-list", files);
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(win);
  registerLLMSessionHandlers(store);
  registerDBSessionHandlers(dbTable);
  registerStoreHandlers(store, fileWatcher);
  registerFileHandlers(store, dbTable, win);
}

app.whenReady().then(async () => {
  // const userDirectory = store.get(StoreKeys.UserDirectory) as string;
  createWindow();

  // if (userDirectory) {
  //   await dbTable.initialize(dbConnection, userDirectory);
  //   await maybeRePopulateTable(dbTable, userDirectory, markdownExtensions);
  //   if (win) {
  //     startWatchingDirectory(win, userDirectory);
  //   }
  // }
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
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

ipcMain.handle("open-directory-dialog", async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  } else {
    return null;
  }
});

ipcMain.on("index-files-in-directory", async (event, userDirectory: string) => {
  // this should be called by default and
  const dbPath = path.join(app.getPath("userData"), "vectordb");
  dbConnection = await lancedb.connect(dbPath);

  await dbTable.initialize(dbConnection, userDirectory);

  await repopulateTableWithMissingItems(
    dbTable,
    userDirectory,
    markdownExtensions,
    (progress) => {
      event.sender.send("indexing-progress", progress);
    }
  );
  if (win) {
    startWatchingDirectory(win, userDirectory, markdownExtensions);
    updateFileListForRenderer(win, userDirectory, markdownExtensions);
  }
  event.sender.send("indexing-complete", "success");
});

ipcMain.on("show-context-menu-file-item", (event, file: FileInfoNode) => {
  const menu = new Menu();
  menu.append(
    new MenuItem({
      label: "Delete",
      click: () => {
        console.log(file.path);
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("An error occurred:", err);
            return;
          }
          console.log(`File at ${file.path} was deleted successfully.`);
        }); // event.sender.send("context-menu-command", "delete");
      },
    })
  );

  console.log("menu key: ", file);

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) {
    menu.popup({ window: browserWindow });
  }
});
