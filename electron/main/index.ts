import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import { update } from "./update";
import Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import { StoreKeys, StoreSchema } from "./Config/storeConfig";
import {
  LlamaCPPModelLoader,
  LlamaCPPSessionService,
} from "./llm/models/LlamaCpp";
import * as lancedb from "vectordb";
import {
  Field,
  type FixedSizeListBuilder,
  Float32,
  makeBuilder,
  RecordBatchFileWriter,
  Utf8,
  Int32,
  type Vector,
  FixedSizeList,
  vectorFromArray,
  Schema,
  Table as ArrowTable,
  RecordBatchStreamWriter,
  Float64,
} from "apache-arrow";
import { DatabaseFields } from "./database/Schema";
import {
  RagnoteDBEntry,
  RagnoteTable,
  maybeRePopulateTable,
  updateNoteInTable,
} from "./database/Table";
import { FSWatcher } from "fs";
import chokidar from "chokidar";
import {
  GetFilesInfoTree,
  moveFileOrDirectoryInFileSystem,
  orchestrateEntryMove,
  startWatchingDirectory,
  updateFileListForRenderer,
  writeFileSyncRecursive,
} from "./Files/Filesystem";
import { registerLLMSessionHandlers } from "./llm/llmSessionHandlers";
import { FileInfoTree } from "./Files/Types";
import { registerDBSessionHandlers } from "./database/dbSessionHandlers";

const store = new Store<StoreSchema>();
// const user = store.get("user");

// // Check if 'user' and 'directory' exist before attempting to delete
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

const markdownExtensions = [".md", ".markdown", ".mdown", ".mkdn", ".mkd"];

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
}

app.whenReady().then(async () => {
  const dbPath = path.join(app.getPath("userData"), "vectordb");
  console.log("PATH IS: ", dbPath);
  dbConnection = await lancedb.connect(dbPath);

  await dbTable.initialize(dbConnection);
  const userDirectory = store.get(StoreKeys.UserDirectory) as string;
  createWindow();

  if (userDirectory) {
    await maybeRePopulateTable(dbTable, userDirectory, markdownExtensions);
    if (win) {
      startWatchingDirectory(win, userDirectory);
    }
  }
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
    properties: ["openDirectory"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  } else {
    return null;
  }
});

ipcMain.on("set-user-directory", (event, userDirectory: string) => {
  console.log("setting user directory", userDirectory);
  store.set(StoreKeys.UserDirectory, userDirectory);
  if (fileWatcher) {
    fileWatcher.close();
  }

  if (win) {
    startWatchingDirectory(win, userDirectory);
    updateFileListForRenderer(win, userDirectory, markdownExtensions);
  }
  maybeRePopulateTable(dbTable, userDirectory, markdownExtensions);
  event.returnValue = "success";
});

ipcMain.on("set-openai-api-key", (event, apiKey: string) => {
  console.log("setting openai api key", apiKey);
  try {
    if (!apiKey) {
      throw new Error("API Key cannot be empty");
    }
    store.set(StoreKeys.UserOpenAIAPIKey, apiKey);
  } catch (error) {
    console.error("Error setting openai api key", error);
  }
  event.returnValue = "success";
});

ipcMain.on("get-openai-api-key", (event) => {
  const apiKey = store.get(StoreKeys.UserOpenAIAPIKey);
  event.returnValue = apiKey;
});

ipcMain.on("get-user-directory", (event) => {
  const path = store.get(StoreKeys.UserDirectory);
  event.returnValue = path;
});

ipcMain.handle("join-path", (event, ...args) => {
  return path.join(...args);
});

ipcMain.handle("get-files", async (): Promise<FileInfoTree> => {
  const directoryPath: string = store.get(StoreKeys.UserDirectory);
  if (!directoryPath) return [];

  const files: FileInfoTree = GetFilesInfoTree(directoryPath);
  return files;
});

ipcMain.handle(
  "read-file",
  async (event, filePath: string): Promise<string> => {
    return fs.readFileSync(filePath, "utf-8");
  }
);

ipcMain.handle(
  "write-file",
  async (event, filePath: string, content: string): Promise<void> => {
    console.log("writing file", filePath);
    // so here we can use the table we've created to add and remove things from the database. And all of the methods can be async to not hold up any threads
    await updateNoteInTable(dbTable, filePath, content);
    await fs.writeFileSync(filePath, content, "utf-8");
    win?.webContents.send("vector-database-update");
  }
);

// create new file handler:
ipcMain.handle(
  "create-file",
  async (event, filePath: string, content: string): Promise<void> => {
    console.log("Creating file", filePath);
    if (!fs.existsSync(filePath)) {
      // If the file does not exist, create it
      writeFileSyncRecursive(filePath, content, "utf-8");
    } else {
      // If the file exists, log a message and do nothing
      console.log("File already exists:", filePath);
    }
  }
);

ipcMain.handle(
  "move-file-or-dir",
  async (event, sourcePath: string, destinationPath: string) => {
    try {
      orchestrateEntryMove(
        dbTable,
        sourcePath,
        destinationPath,
        markdownExtensions
      );
    } catch (error) {
      console.error("Error moving file or directory:", error);
      return { success: false, error: error };
    }
  }
);

export async function convertToTable<T>(
  data: Array<Record<string, unknown>>,
  embeddings?: lancedb.EmbeddingFunction<T>
): Promise<ArrowTable> {
  if (data.length === 0) {
    throw new Error("At least one record needs to be provided");
  }

  const columns = Object.keys(data[0]);
  const records: Record<string, Vector> = {};

  for (const columnsKey of columns) {
    if (columnsKey === "vector") {
      const vectorSize = (data[0].vector as any[]).length;
      const listBuilder = newVectorBuilder(vectorSize);
      for (const datum of data) {
        if ((datum[columnsKey] as any[]).length !== vectorSize) {
          throw new Error(`Invalid vector size, expected ${vectorSize}`);
        }

        listBuilder.append(datum[columnsKey]);
      }
      records[columnsKey] = listBuilder.finish().toVector();
    } else {
      const values = [];
      for (const datum of data) {
        values.push(datum[columnsKey]);
      }

      if (columnsKey === embeddings?.sourceColumn) {
        const vectors = await embeddings.embed(values as T[]);
        records.vector = vectorFromArray(
          vectors,
          newVectorType(vectors[0].length)
        );
        console.log("records.vector", records.vector);
      }

      if (typeof values[0] === "string") {
        // `vectorFromArray` converts strings into dictionary vectors, forcing it back to a string column
        records[columnsKey] = vectorFromArray(values, new Utf8());
      } else {
        records[columnsKey] = vectorFromArray(values);
      }
    }
  }

  return new ArrowTable(records);
}

function newVectorBuilder(dim: number): FixedSizeListBuilder<Float32> {
  return makeBuilder({
    type: newVectorType(dim),
  });
}

function newVectorType(dim: number): FixedSizeList<Float32> {
  // Somewhere we always default to have the elements nullable, so we need to set it to true
  // otherwise we often get schema mismatches because the stored data always has schema with nullable elements
  const children = new Field<Float32>("item", new Float32(), true);
  return new FixedSizeList(dim, children);
}
