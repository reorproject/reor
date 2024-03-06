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
import {
  getVaultDirectoryForContents,
  getWindowInfoForContents,
  activeWindows,
} from "../windowManager";
import { LLMSessions } from "../llm/llmSessionHandlers";
import {
  PromptWithContextLimit,
  createPromptWithContextLimitFromContent,
} from "../Prompts/Prompts";

export const registerFileHandlers = () => {
  ipcMain.handle("join-path", (event, ...args) => {
    return path.join(...args);
  });

  ipcMain.handle(
    "get-files-for-window",
    async (event): Promise<FileInfoTree> => {
      const directoryPath = getVaultDirectoryForContents(
        activeWindows,
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
    const windowInfo = getWindowInfoForContents(activeWindows, event.sender);
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
      const windowInfo = getWindowInfoForContents(activeWindows, event.sender);
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
      { prompt, llmSessionID, filePath }: AugmentPromptWithFileProps
    ): Promise<PromptWithContextLimit> => {
      try {
        const content = fs.readFileSync(filePath, "utf-8");

        const llmSession = LLMSessions[llmSessionID];
        if (!llmSession) {
          throw new Error(`Session ${llmSessionID} does not exist.`);
        }

        const { prompt: filePrompt, contextCutoffAt } =
          createPromptWithContextLimitFromContent(
            content,
            prompt,
            llmSession.tokenize,
            llmSession.getContextLength()
          );
        return { prompt: filePrompt, contextCutoffAt };
      } catch (error) {
        console.error("Error searching database:", error);
        throw error;
      }
    }
  );
};
