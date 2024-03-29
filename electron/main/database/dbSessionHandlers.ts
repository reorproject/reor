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

const MAX_COSINE_DISTANCE = 0.4;

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
          (entry) => entry._distance < MAX_COSINE_DISTANCE
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

  ipcMain.handle(
    "augment-prompt-with-temporal-agent",
    async (event, query: string, llmName: string): Promise<string> => {
      const llmSession = openAISession;
      const llmConfig = await getLLMConfig(store, ollamaService, llmName);
      console.log("llmConfig", llmConfig);
      if (!llmConfig) {
        throw new Error(`LLM ${llmName} not configured.`);
      }

      const llmFilter = await llmSession.response(
        llmName,
        llmConfig,
        [
          {
            role: "system",
            content: `You are an experienced SQL engineer. Given an input user query, you will generate a temporal filter for the query. 
If there is no temporal component in the query, you must return an empty string. For your reference, the timestamp right now is ${formatTimestampForLanceDB(
              new Date()
            )}.
An example of a temporal filter is:
${DatabaseFields.FILE_MODIFIED} > timestamp '2024-03-16 13:00:00'

Please generate ONLY the temporal filter using the same format as the example given. Please also make sure you only use the ${
              DatabaseFields.FILE_MODIFIED
            } field in the filter. If you don't know or there is no temporal component in the query, please return an empty string.`,
          },
          {
            role: "user",
            content: query,
          },
        ],
        store.get(StoreKeys.LLMGenerationParameters)
      );

      try {
        let searchResults: DBEntry[] = [];
        const maxRAGExamples: number = store.get(StoreKeys.MaxRAGExamples);
        const windowInfo = windowManager.getWindowInfoForContents(event.sender);
        if (!windowInfo) {
          throw new Error("Window info not found.");
        }
        // const filter = `${DatabaseFields.FILE_MODIFIED} > timestamp '2024-03-16 13:00:00'`;
        // const filter = "sadjfaosdifjasdf";
        // console.log("filter", filter);
        const filter = llmFilter.choices[0].message.content ?? "";
        console.log("filter", filter);
        if (maxRAGExamples && maxRAGExamples > 0) {
          searchResults = await windowInfo.dbTableClient.search(
            query,
            maxRAGExamples,
            filter
          );
          // console.log("searchResults", searchResults);
        } else {
          throw new Error("Max RAG examples is not set or is invalid.");
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
        throw errorToString(error);
      }
    }
  );

  ipcMain.handle("get-database-fields", () => {
    return DatabaseFields;
  });
};

function formatTimestampForLanceDB(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is zero-based
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Pad single digits with leading zeros
  const monthPadded = month.toString().padStart(2, "0");
  const dayPadded = day.toString().padStart(2, "0");
  const hoursPadded = hours.toString().padStart(2, "0");
  const minutesPadded = minutes.toString().padStart(2, "0");
  const secondsPadded = seconds.toString().padStart(2, "0");

  return `timestamp '${year}-${monthPadded}-${dayPadded} ${hoursPadded}:${minutesPadded}:${secondsPadded}'`;
}
