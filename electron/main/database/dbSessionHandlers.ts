import { ipcMain } from "electron";
import { LanceDBTableWrapper } from "./LanceTableWrapper";
import { createRAGPrompt } from "../Prompts/Prompts";
import { DBEntry, DatabaseFields } from "./Schema";
import { LLMSessions } from "../llm/llmSessionHandlers";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";

export const registerDBSessionHandlers = (
  dbTable: LanceDBTableWrapper,
  store: Store<StoreSchema>
) => {
  ipcMain.handle(
    "search",
    async (
      event,
      query: string,
      limit: number,
      filter?: string
    ): Promise<DBEntry[]> => {
      try {
        const searchResults = await dbTable.search(query, limit, filter);
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
      llmSessionID: string,
      filter?: string
    ): Promise<string> => {
      try {
        let searchResults: DBEntry[] = [];
        const maxRAGExamples: number = store.get(StoreKeys.MaxRAGExamples);

        if (maxRAGExamples && maxRAGExamples > 0) {
          searchResults = await dbTable.search(query, maxRAGExamples, filter);
        } else {
          throw new Error("Max RAG examples is not set or is invalid.");
        }

        const llmSession = LLMSessions[llmSessionID];
        if (!llmSession) {
          throw new Error(`Session ${llmSessionID} does not exist.`);
        }

        const ragPrompt = createRAGPrompt(
          searchResults,
          query,
          llmSession.tokenize,
          llmSession.getContextLength()
        );
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
