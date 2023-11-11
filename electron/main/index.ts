import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import { update } from "./update";
import Store from "electron-store";
import * as path from "path";
import * as fs from "fs";
import { StoreKeys, StoreSchema } from "./storeConfig";
import { ModelLoader, SessionService } from "./llm/nodellamacpp";
import {
  createEmbeddingFunction,
  setupPipeline,
} from "./embeddings/Transformers";
import * as lancedb from "vectordb";
import GetOrCreateTable from "./embeddings/Lance";
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
import { DatabaseFields } from "./embeddings/Schema";
import { RagnoteTable } from "./embeddings/Table";
// import { testDownload } from "./download/download";

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
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Apply electron-updater
  update(win);
}

app.whenReady().then(async () => {
  // const pipe = await setupPipeline("Xenova/all-MiniLM-L6-v2");
  // console.log(pipe);
  console.log("PATH IS: ", path.join(app.getPath("userData"), "vectordb"));
  dbConnection = await lancedb.connect(
    path.join(app.getPath("userData"), "vectordb")
  );
  // db.dropTable("test-table");

  // So we could just try this:
  await dbTable.initialize(dbConnection, "test-table");
  // if error pipeline not initialized, we tell the frontend what to show...
  // dbTable = await GetOrCreateTable(dbConnection, "test-table");
  // // console.log("table schema",)
  // console.log("CALLING ADD:");
  const currentTimestamp: Date = new Date();
  // console.log("currentTimestamp", currentTimestamp);
  await dbTable.add([
    {
      notepath: "test-path",
      content: "test-content",
      subnoteindex: 0,
      timeadded: currentTimestamp,
    },
  ]);
  const result = await dbTable.search("h", 2);
  // console.log("result", result);
  const filterResult = await dbTable.filter(
    `${DatabaseFields.NOTE_PATH} == "test-path"`
  );
  // console.log("filterResult", filterResult);
  // console.log("filterResult", filterResult);
  // console.log("STARTING QUERY");
  // // const query = new lancedb.Query(table);
  // const results = await table.search("hello").limit(2).execute();

  // // const results = await query.filter("sdfjapsofd").execute();
  // console.log("results", results);
  // const search = table.search(null);
  // testDownload().catch((error) => console.error(error));

  createWindow();
});

// app.whenReady().then(async () => {
// createWindow();

// const pipe = await setupPipeline("Xenova/all-MiniLM-L6-v2");
// console.log(pipe);
// const uri = "data/sample-lancedb";
// const db = await lancedb.connect(uri);
// db.dropTable("test-table");
// const table = await GetOrCreateTable(db, "test-table");
// // // console.log("table schema",)
// // console.log("CALLING ADD:");
// const currentTimestamp: Date = new Date();
// const currentTimestampInMilliseconds: number = currentTimestamp.getTime();

// console.log("currentTimestamp", currentTimestamp);
// console.log("currentTimestampInMilliseconds", currentTimestampInMilliseconds);
// table.add([
//   {
//     path: "test-path",
//     content: "test-content",
//     subNoteIndex: 0,
//     timeAdded: currentTimestamp,
//   },
// ]);
// const result = await table.search("h").limit(2).execute();
// console.log("result", result);
// const data = [
//   {
//     path: "test-path",
//     content: "test-content",
//     subNoteIndex: 0,
//     timeAdded: currentTimestamp, // Convert current time to nanoseconds since Unix epoch
//     // vector: [1.0], //await pipe("test-content", { pooling: "mean", normalize: true }),
//   },
//   // { id: 1, text: "Cherry", type: "fruit" },
//   // { id: 2, text: "Carrot", type: "vegetable" },
//   // { id: 3, text: "Potato", type: "vegetable" },
//   // { id: 4, text: "Apple", type: "fruit" },
//   // { id: 5, text: "Banana", type: "fruit" },
// ];
// const schema = new Schema([
//   new Field("id", new Float64(), false),
//   new Field(
//     "vector",
//     new FixedSizeList(384, new Field("item", new Float32())),
//     false
//   ),
//   new Field("text", new Utf8(), false),
//   new Field("type", new Utf8(), false),
// ]);

// // Create the table with the embedding function
// const embedFunc = await createEmbeddingFunction(
//   "all-MiniLM-L6-v2",
//   "content"
// );
// const newTable = await db.createTable({
//   name: "food_table",
//   data,
//   embeddingFunction: embedFunc,
// });
// console.log("NEW TABLE", newTable);
// // table.add(data);
// const arrowTable: ArrowTable = await convertToTable(data, embedFunc);
// console.log("arrowTable", arrowTable);
// console.log("arrowTable", arrowTable.schema);
// console.log("arrowTable", arrowTable.schema);
// for (const field of arrowTable.schema.fields) {
//   console.log(`Field Name: ${field.name}, Type: ${field.type}`);
// }
// const table = await db.createTable("food_table", data, embedFunc);
// console.log("created table: ", table);
// });

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// IPC listener
// ipcMain.on("electron-store-get", async (event, val) => {
//   event.returnValue = store.get(val);
// });
// ipcMain.on("electron-store-set", async (event, key, val) => {
//   store.set(key, val);
// });

ipcMain.on("set-user-directory", (event, path: string) => {
  // Your validation logic for the directory path
  store.set(StoreKeys.UserDirectory, path);
  // WatchFiles(path, (filename) => {
  //   // event.sender.send('file-changed', filename);
  //   console.log("FILE CHANGED: ", filename);
  // });
  event.returnValue = "success";
});

ipcMain.on("get-user-directory", (event) => {
  const path = store.get(StoreKeys.UserDirectory);
  event.returnValue = path;
});

interface FileInfo {
  name: string;
  path: string;
}

ipcMain.handle("get-files", async (): Promise<FileInfo[]> => {
  const directoryPath: any = store.get(StoreKeys.UserDirectory);
  if (!directoryPath) return [];

  const files: string[] = fs.readdirSync(directoryPath);
  return files.map((file: string) => ({
    name: file,
    path: path.join(directoryPath, file),
  }));
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
    await updateNoteInDB(dbTable, filePath, content);
    console.log("content to write", content);
    fs.writeFileSync(filePath, content, "utf-8");
  }
);

const updateNoteInDB = async (
  dbTable: RagnoteTable,
  filePath: string,
  content: string
): Promise<void> => {
  // TODO: maybe convert this to have try catch blocks.
  console.log("deleting from table:");
  await dbTable.delete(`${DatabaseFields.NOTE_PATH} = "${filePath}"`);
  const currentTimestamp: Date = new Date();
  console.log("adding back to table:");
  await dbTable.add([
    {
      notepath: filePath,
      content: content,
      subnoteindex: 0,
      timeadded: currentTimestamp,
    },
  ]);
};

// const modelLoader = new ModelLoader(); // Singleton
// const sessions: { [sessionId: string]: SessionService } = {};

// ipcMain.handle("createSession", async (event, sessionId: string) => {
//   if (sessions[sessionId]) {
//     throw new Error(`Session ${sessionId} already exists.`);
//   }
//   // sessionService.webContents = event.sender; // Attach the webContents of the sender to your session service
//   const webContents = event.sender;
//   const sessionService = new SessionService(modelLoader, webContents);
//   sessions[sessionId] = sessionService;
//   return sessionId;
// });

// ipcMain.handle("getHello", async (event, sessionId: string) => {
//   const sessionService = sessions[sessionId];
//   if (!sessionService) {
//     throw new Error(`Session ${sessionId} does not exist.`);
//   }

//   console.log("getting hello");
//   const getHelloResponse = await sessionService.getHello();
//   console.log("getHelloResponse", getHelloResponse);
//   return getHelloResponse;
// });

// ipcMain.handle(
//   "initializeStreamingResponse",
//   async (event, sessionId: string, prompt: string) => {
//     const sessionService = sessions[sessionId];
//     if (!sessionService) {
//       throw new Error(`Session ${sessionId} does not exist.`);
//     }

//     return sessionService.streamingPrompt(prompt);
//   }
// );

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
