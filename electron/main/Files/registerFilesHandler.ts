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
  dbTables: Map<string, LanceDBTableWrapper>,
  win: BrowserWindow
) => {
  ipcMain.handle("join-path", (event, ...args) => {
    return path.join(...args);
  });

  ipcMain.handle(
    "get-files",
    async (event, windowVaultDirectory: string): Promise<FileInfoTree> => {
      const files: FileInfoTree = GetFilesInfoTree(windowVaultDirectory);
      return files;
    }
  );

  ipcMain.handle(
    "read-file",
    async (event, filePath: string): Promise<string> => {
      return fs.readFileSync(filePath, "utf-8");
    }
  );

  ipcMain.handle(
    "write-file",
    async (
      event,
      filePath: string,
      content: string,
      vaultDirectory: string
    ): Promise<void> => {
      console.log("Writing file", filePath);
      await fs.writeFileSync(filePath, content, "utf-8");
      console.log("Done writing file", filePath);
      try {
        const dbTable = dbTables.get(vaultDirectory);
        if (!dbTable) {
          throw new Error(
            `No database table found for directory ${vaultDirectory}`
          );
        }
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
        // If the file does not exist, create it
        writeFileSyncRecursive(filePath, content, "utf-8");
      } else {
        // If the file exists, log a message and do nothing
        console.log("File already exists:", filePath);
      }
    }
  );

  ipcMain.handle(
    "create-directory",
    async (event, dirPath: string): Promise<void> => {
      console.log("Creating directory", dirPath);

      // Function to create directory recursively
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
        // Check if the directory already exists
        if (!fs.existsSync(dirPath)) {
          // If the directory does not exist, create it
          mkdirRecursiveSync(dirPath);
        } else {
          // If the directory exists, log a message and do nothing
          console.log("Directory already exists:", dirPath);
        }
      } catch (error) {
        console.error("Error creating directory:", dirPath, error);
      }
    }
  );

  ipcMain.handle(
    "move-file-or-dir",
    async (
      event,
      sourcePath: string,
      destinationPath: string,
      vaultDirectory: string
    ) => {
      try {
        const dbTable = dbTables.get(vaultDirectory);
        if (!dbTable) {
          throw new Error(
            `No database table found for directory ${vaultDirectory}`
          );
        }
        orchestrateEntryMove(dbTable, sourcePath, destinationPath);
      } catch (error) {
        console.error("Error moving file or directory:", error);
      }
    }
  );
};
