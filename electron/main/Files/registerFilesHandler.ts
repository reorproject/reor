import { BrowserWindow, ipcMain } from "electron";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import * as path from "path";
import { FileInfoTree } from "./Types";
import {
  GetFilesInfoTree,
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
      console.log("Writing file", filePath);
      await fs.writeFileSync(filePath, content, "utf-8");
      console.log("Done writing file", filePath);
      try {
        await updateFileInTable(dbTable, filePath, content);
        win?.webContents.send("vector-database-update");
      } catch (error) {
        console.error("Error updating file in table:", error);
      }
    }
  );

  ipcMain.handle(
    "create-file",
    async (event, filePath: string, content: string): Promise<void> => {
      console.log("Creating file", filePath);
      if (!fs.existsSync(filePath)) {
        writeFileSyncRecursive(filePath, content, "utf-8");
      } else {
        console.log("File already exists:", filePath);
      }
    }
  );

  ipcMain.handle(
    "create-directory",
    async (event, dirPath: string): Promise<void> => {
      console.log("Creating directory", dirPath);

      const mkdirRecursiveSync = (dirPath: string) => {
        const parentDir = path.dirname(dirPath);
        if (!fs.existsSync(parentDir)) {
          mkdirRecursiveSync(parentDir);
        }
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
      };

      try {
        if (!fs.existsSync(dirPath)) {
          mkdirRecursiveSync(dirPath);
        } else {
          console.log("Directory already exists:", dirPath);
        }
      } catch (error) {
        console.error("Error creating directory:", dirPath, error);
      }
    }
  );

  ipcMain.handle(
    "move-file-or-dir",
    async (event, sourcePath: string, destinationPath: string) => {
      try {
        orchestrateEntryMove(dbTable, sourcePath, destinationPath);
      } catch (error) {
        console.error("Error moving file or directory:", error);
      }
    }
  );
};
