import { app, BrowserWindow, shell, ipcMain } from "electron";
import { release } from "node:os";
import { join } from "node:path";
import { update } from "./update";
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
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
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

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
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
  createWindow();

  // const pipe = await setupPipeline("Xenova/all-MiniLM-L6-v2");
  // console.log(pipe);
  const uri = "data/sample-lancedb";
  const db = await lancedb.connect(uri);
  // db.dropTable("test-table");
  const table = await GetOrCreateTable(db, "test-table");
  // // console.log("table schema",)
  // console.log("CALLING ADD:");
  table.add([
    {
      path: "test-path",
      content: "test-content",
      subNoteIndex: 0,
      // vector: [1.0], //await pipe("test-content", { pooling: "mean", normalize: true }),
    },
  ]);
  // const data = [
  //   {
  //     path: "test-path",
  //     content: "test-content",
  //     subNoteIndex: 0,
  //     // vector: [1.0], //await pipe("test-content", { pooling: "mean", normalize: true }),
  //   },
  // { id: 1, text: "Cherry", type: "fruit" },
  // { id: 2, text: "Carrot", type: "vegetable" },
  // { id: 3, text: "Potato", type: "vegetable" },
  // { id: 4, text: "Apple", type: "fruit" },
  // { id: 5, text: "Banana", type: "fruit" },
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
  // // const table = await db.createTable({
  // //   name: "food_table",
  // //   schema,
  // //   embeddingFunction: embedFunc,
  // // });
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
