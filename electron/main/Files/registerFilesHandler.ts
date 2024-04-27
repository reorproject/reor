import { ipcMain } from "electron";
import * as path from "path";
import {
  FileInfoTree,
  AugmentPromptWithFileProps,
  WriteFileProps,
  RenameFileProps,
} from "./Types";
import {
  GetFilesInfoTree,
  orchestrateEntryMove,
  createFileRecursive,
  isHidden,
  GetFilesInfoListForListOfPaths,
} from "./Filesystem";
import * as fs from "fs";
import {
  convertFileInfoListToDBItems,
  updateFileInTable,
} from "../database/TableHelperFunctions";
import { ollamaService, openAISession } from "../llm/llmSessionHandlers";
import {
  PromptWithContextLimit,
  createPromptWithContextLimitFromContent,
} from "../Prompts/Prompts";
import Store from "electron-store";
import { StoreSchema } from "../Store/storeConfig";
import { getLLMConfig } from "../llm/llmConfig";
import WindowsManager from "../windowManager";
import { DBEntry } from "../database/Schema";

export const registerFileHandlers = (
  store: Store<StoreSchema>,
  windowsManager: WindowsManager
) => {
  ipcMain.handle(
    "get-files-tree-for-window",
    async (event): Promise<FileInfoTree> => {
      const directoryPath = windowsManager.getVaultDirectoryForWinContents(
        event.sender
      );
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

  ipcMain.handle("check-file-exists", async (event, filePath) => {
    try {
      // Attempt to access the file to check existence
      await fs.promises.access(filePath, fs.constants.F_OK);
      // If access is successful, return true
      return true;
    } catch (error) {
      // If an error occurs (e.g., file doesn't exist), return false
      return false;
    }
  });

  ipcMain.handle(
    "delete-file",
    async (event, filePath: string): Promise<void> => {
      console.log("Deleting file", filePath);
      fs.stat(filePath, async (err, stats) => {
        if (err) {
          console.error("An error occurred:", err);
          return;
        }

        if (stats.isDirectory()) {
          // For directories (Node.js v14.14.0 and later)
          fs.rm(filePath, { recursive: true }, (err) => {
            if (err) {
              console.error("An error occurred:", err);
              return;
            }
            console.log(`Directory at ${filePath} was deleted successfully.`);
          });

          const windowInfo = windowsManager.getWindowInfoForContents(
            event.sender
          );
          if (!windowInfo) {
            throw new Error("Window info not found.");
          }
          await windowInfo.dbTableClient.deleteDBItemsByFilePaths([filePath]);
        } else {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("An error occurred:", err);
              return;
            }
            console.log(`File at ${filePath} was deleted successfully.`);
          });

          const windowInfo = windowsManager.getWindowInfoForContents(
            event.sender
          );
          if (!windowInfo) {
            throw new Error("Window info not found.");
          }
          await windowInfo.dbTableClient.deleteDBItemsByFilePaths([filePath]);
        }
      });
    }
  );

  ipcMain.handle(
    "write-file",
    async (event, writeFileProps: WriteFileProps) => {
      if (!fs.existsSync(path.dirname(writeFileProps.filePath))) {
        fs.mkdirSync(path.dirname(writeFileProps.filePath), {
          recursive: true,
        });
      }
      fs.writeFileSync(
        writeFileProps.filePath,
        writeFileProps.content,
        "utf-8"
      );
    }
  );

  ipcMain.handle("is-directory", (event, filepath: string) => {
    return fs.statSync(filepath).isDirectory();
  });

  ipcMain.handle(
    "rename-file-recursive",
    async (event, renameFileProps: RenameFileProps) => {
      const windowInfo = windowsManager.getWindowInfoForContents(event.sender);

      if (!windowInfo) {
        throw new Error("Window info not found.");
      }
      windowsManager.watcher?.unwatch(windowInfo?.vaultDirectoryForWindow);

      fs.rename(
        renameFileProps.oldFilePath,
        renameFileProps.newFilePath,
        (err) => {
          if (err) {
            throw err;
          }
          windowsManager.watcher?.add(windowInfo?.vaultDirectoryForWindow);
        }
      );

      // then need to trigger reindexing of folder
      windowInfo.dbTableClient.updateDBItemsWithNewFilePath(
        renameFileProps.oldFilePath,
        renameFileProps.newFilePath
      );
    }
  );

  ipcMain.handle("index-file-in-database", async (event, filePath: string) => {
    const windowInfo = windowsManager.getWindowInfoForContents(event.sender);
    if (!windowInfo) {
      throw new Error("Window info not found.");
    }
    await updateFileInTable(windowInfo.dbTableClient, filePath);
  });

  ipcMain.handle(
    "create-file",
    async (event, filePath: string, content: string): Promise<void> => {
      createFileRecursive(filePath, content, "utf-8");
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
      const windowInfo = windowsManager.getWindowInfoForContents(event.sender);
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

  ipcMain.handle(
    "augment-prompt-with-file",
    async (
      _event,
      { prompt, llmName, filePath }: AugmentPromptWithFileProps
    ): Promise<PromptWithContextLimit> => {
      try {
        const content = fs.readFileSync(filePath, "utf-8");

        const llmSession = openAISession;
        const llmConfig = await getLLMConfig(store, ollamaService, llmName);
        if (!llmConfig) {
          throw new Error(`LLM ${llmName} not configured.`);
        }
        const systemPrompt = "Based on the following information:\n";
        const { prompt: filePrompt, contextCutoffAt } =
          createPromptWithContextLimitFromContent(
            content,
            systemPrompt,
            prompt,
            llmSession.getTokenizer(llmName),
            llmConfig.contextLength
          );
        return { prompt: filePrompt, contextCutoffAt };
      } catch (error) {
        console.error("Error searching database:", error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    "get-filesystem-paths-as-db-items",
    async (_event, filePaths: string[]): Promise<DBEntry[]> => {
      try {
        const fileItems = GetFilesInfoListForListOfPaths(filePaths);
        console.log("fileItems", fileItems);
        const dbItems = await convertFileInfoListToDBItems(fileItems);
        console.log("dbItems", dbItems);
        return dbItems.flat();
      } catch (error) {
        console.error("Error searching database:", error);
        throw error;
      }
    }
  );

  ipcMain.handle("get-files-in-directory", (event, dirName: string) => {
    const itemsInDir = fs
      .readdirSync(dirName)
      .filter((item) => !isHidden(item));
    return itemsInDir;
  });
};
