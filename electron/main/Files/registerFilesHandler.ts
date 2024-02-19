import { BrowserWindow, ipcMain } from "electron";
import { StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import * as path from "path";
import { FileInfoTree } from "./Types";
import {
  GetFilesInfoTree,
  orchestrateEntryMove,
  writeFileSyncRecursive,
} from "./Filesystem";
import * as fs from "fs";
import { updateFileInTable } from "../database/TableHelperFunctions";
import {
  getVaultDirectoryForContents,
  getWindowInfoForContents,
  windows,
} from "../windowManager";

export const registerFileHandlers = (
  store: Store<StoreSchema>,
  win: BrowserWindow
) => {
  ipcMain.handle("join-path", (event, ...args) => {
    return path.join(...args);
  });

  ipcMain.handle(
    "get-files-for-window",
    async (event): Promise<FileInfoTree> => {
      const directoryPath = getVaultDirectoryForContents(windows, event.sender);
      if (!directoryPath) return [];

      const files: FileInfoTree = GetFilesInfoTree(directoryPath);
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
    async (event, filePath: string, content: string): Promise<void> => {
      await fs.writeFileSync(filePath, content, "utf-8");
      const windowInfo = getWindowInfoForContents(windows, event.sender);
      if (!windowInfo) {
        throw new Error("Window info not found.");
      }
      try {
        await updateFileInTable(windowInfo.dbTableClient, filePath, content);
        win?.webContents.send("vector-database-update");
      } catch (error) {
        // not thrown due to random db errors:
        console.error("Error updating file in table:", error);
      }
    }
  );

  ipcMain.handle(
    "create-file",
    async (event, filePath: string, content: string): Promise<void> => {
      writeFileSyncRecursive(filePath, content, "utf-8");
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

      if (!fs.existsSync(dirPath)) {
        mkdirRecursiveSync(dirPath);
      } else {
        console.log("Directory already exists:", dirPath);
      }
    }
  );

  ipcMain.handle(
    "move-file-or-dir",
    async (event, sourcePath: string, destinationPath: string) => {
      const windowInfo = getWindowInfoForContents(windows, event.sender);
      if (!windowInfo) {
        throw new Error("Window info not found.");
      }
      orchestrateEntryMove(
        windowInfo.dbTableClient,
        sourcePath,
        destinationPath
      );
    }
  );
};
