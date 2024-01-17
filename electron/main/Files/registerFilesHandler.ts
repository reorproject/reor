import { BrowserWindow, ipcMain } from "electron";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import * as path from "path";
import { FileInfoTree } from "./Types";
import {
  GetFilesInfoTree,
  markdownExtensions,
  orchestrateEntryMove,
  writeFileSyncRecursive,
} from "./Filesystem";
import * as fs from "fs";
import { LanceDBTableWrapper } from "../database/LanceTableWrapper";
import { updateFileInTable } from "../database/TableHelperFunctions";

export const registerFileHandlers = (
  store: Store<StoreSchema>,
  dbTable: LanceDBTableWrapper,
  win: BrowserWindow
) => {
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
      await updateFileInTable(dbTable, filePath, content);
      await fs.writeFileSync(filePath, content, "utf-8");
      win?.webContents.send("vector-database-update");
    }
  );

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
      }
    }
  );
};
