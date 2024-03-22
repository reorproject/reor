import { ipcMain } from "electron";
import { createPromptWithContextLimitFromContent } from "../Prompts/Prompts";
import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";
import { ollamaService, openAISession } from "../llm/llmSessionHandlers";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { getLLMConfig } from "../llm/llmConfig";
import { errorToString } from "../Generic/error";
import WindowsManager from "../windowManager";

export interface PromptWithRagResults {
  ragPrompt: string;
  uniqueFilesReferenced: string[];
}

export const registerDBSessionHandlers = (
  // dbTable: LanceDBTableWrapper,
  store: Store<StoreSchema>,
  windowManager: WindowsManager
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
        const windowInfo = windowManager.getWindowInfoForContents(event.sender);
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
    ): Promise<PromptWithRagResults> => {
      try {
        let searchResults: DBQueryResult[] = [];
        const maxRAGExamples: number = store.get(StoreKeys.MaxRAGExamples);
        const windowInfo = windowManager.getWindowInfoForContents(event.sender);
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
        const llmConfig = await getLLMConfig(store, ollamaService, llmName);
        console.log("llmConfig", llmConfig);
        if (!llmConfig) {
          throw new Error(`LLM ${llmName} not configured.`);
        }
        
        const filteredResults = searchResults.filter(
          (entry) => entry._distance < 0.4
        );
        const { prompt: ragPrompt } = createPromptWithContextLimitFromContent(
          filteredResults,
          query,
          llmSession.getTokenizer(llmName),
          llmConfig.contextLength
        );

        // organize the search results by file path - which will include file path previews
        const uniqueFilesReferenced = [
          ...new Set(filteredResults.map((entry) => entry.notepath)),
        ];
        console.log("ragPrompt", ragPrompt);

        return { ragPrompt, uniqueFilesReferenced };
      } catch (error) {
        console.error("Error searching database:", error);
        throw errorToString(error);
      }
    }
  );

  ipcMain.handle("get-database-fields", () => {
    return DatabaseFields;
  });
};
