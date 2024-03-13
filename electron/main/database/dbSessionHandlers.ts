import { ipcMain } from "electron";
import { createPromptWithContextLimitFromContent } from "../Prompts/Prompts";
import { DBEntry, DatabaseFields } from "./Schema";
import { openAISession } from "../llm/llmSessionHandlers";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { getWindowInfoForContents, activeWindows } from "../windowManager";
import { getLLMConfig } from "../Store/storeHandlers";

export const registerDBSessionHandlers = (store: Store<StoreSchema>) => {
  ipcMain.handle(
    "search",
    async (
      event,
      query: string,
      limit: number,
      filter?: string
    ): Promise<DBEntry[]> => {
      try {
        const windowInfo = getWindowInfoForContents(
          activeWindows,
          event.sender
        );
        if (!windowInfo) {
          throw new Error("Window info not found.");
        }
        const searchResults = await windowInfo.dbTableClient.search(
          query,
          limit,
          filter
        );
        return searchResults;
      } catch (error) {
        console.error("Error searching database:", error);
        throw error;
      }
    }
  );

  ipcMain.handle(
    "augment-prompt-with-rag",
    async (
      event,
      query: string,
      llmName: string,
      filter?: string
    ): Promise<string> => {
      try {
        let searchResults: DBEntry[] = [];
        const maxRAGExamples: number = store.get(StoreKeys.MaxRAGExamples);
        const windowInfo = getWindowInfoForContents(
          activeWindows,
          event.sender
        );
        if (!windowInfo) {
          throw new Error("Window info not found.");
        }

        if (maxRAGExamples && maxRAGExamples > 0) {
          searchResults = await windowInfo.dbTableClient.search(
            query,
            maxRAGExamples,
            filter
          );
        } else {
          throw new Error("Max RAG examples is not set or is invalid.");
        }

        const llmSession = openAISession;
        const llmConfig = getLLMConfig(store, llmName);

        console.log("llmConfig", llmConfig);
        if (!llmConfig) {
          throw new Error(`LLM ${llmName} not configured.`);
        }
        const { prompt: ragPrompt } = createPromptWithContextLimitFromContent(
          searchResults,
          query,
          llmSession.getTokenizer(llmName),
          llmConfig.contextLength
        );
        console.log("ragPrompt", ragPrompt);
        return ragPrompt;
      } catch (error) {
        console.error("Error searching database:", error);
        throw error;
      }
    }
  );

  ipcMain.handle("get-database-fields", () => {
    return DatabaseFields;
  });
};
