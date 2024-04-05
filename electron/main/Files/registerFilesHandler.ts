import { ipcMain } from "electron";
import * as path from "path";
import {
  FileInfoTree,
  AugmentPromptWithFileProps,
  WriteFileProps,
} from "./Types";
import {
  GetFilesInfoTree,
  orchestrateEntryMove,
  createFileRecursive,
} from "./Filesystem";
import * as fs from "fs";
import { updateFileInTable } from "../database/TableHelperFunctions";
import { ollamaService, openAISession } from "../llm/llmSessionHandlers";
import {
  PromptWithContextLimit,
  createPromptWithContextLimitFromContent,
} from "../Prompts/Prompts";
import Store from "electron-store";
import { StoreSchema } from "../Store/storeConfig";
import { getLLMConfig } from "../llm/llmConfig";
import WindowsManager from "../windowManager";

export const registerFileHandlers = (
  store: Store<StoreSchema>,
  windowsManager: WindowsManager
) => {
  ipcMain.handle("join-path", (event, ...args) => {
    return path.join(...args);
  });

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
      fs.writeFileSync(
        writeFileProps.filePath,
        writeFileProps.content,
        "utf-8"
      );
    }
  );

  ipcMain.handle("index-file-in-database", async (event, filePath: string) => {
    const windowInfo = windowsManager.getWindowInfoForContents(event.sender);
    if (!windowInfo) {
      throw new Error("Window info not found.");
    }
    await updateFileInTable(windowInfo.dbTableClient, filePath);
    event.sender.send("vector-database-update");
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
        const { prompt: filePrompt, contextCutoffAt } =
          createPromptWithContextLimitFromContent(
            content,
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
};
