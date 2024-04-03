import { ipcMain } from "electron";
import { createPromptWithContextLimitFromContent } from "../Prompts/Prompts";
import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";
import { ollamaService, openAISession } from "../llm/llmSessionHandlers";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { getLLMConfig } from "../llm/llmConfig";
import { errorToString } from "../Generic/error";
import WindowsManager from "../windowManager";
import { BasePromptRequirements } from "./dbSessionHandlerTypes";

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
    async (
      event,
      { query, llmName }: BasePromptRequirements
    ): Promise<PromptWithRagResults> => {
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
            content: `You are an experienced SQL engineer. You are translating natural language queries into temporal filters for a database query. 
            
Below are 2 examples:

Query: 
Summarize all notes modified after March 16, 2024, 1:00 PM.

Filter:
${DatabaseFields.FILE_MODIFIED} > timestamp '2024-03-16 13:00:00'

Query:
Find all files modified after today.

Filter:
${DatabaseFields.FILE_MODIFIED} > ${formatTimestampForLanceDB(new Date())}

For your reference, the timestamp right now is ${formatTimestampForLanceDB(
              new Date()
            )}.Please generate ONLY the temporal filter using the same format as the example given. Please also make sure you only use the ${
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

        const llmGeneratedFilterString =
          llmFilter.choices[0].message.content ?? "";

        try {
          searchResults = await windowInfo.dbTableClient.search(
            query,
            maxRAGExamples,
            llmGeneratedFilterString
          );
        } catch (error) {
          searchResults = await windowInfo.dbTableClient.search(
            query,
            maxRAGExamples
          );
          searchResults = [];
        }

        const { prompt: ragPrompt } = createPromptWithContextLimitFromContent(
          searchResults,
          query,
          llmSession.getTokenizer(llmName),
          llmConfig.contextLength
        );
        console.log("ragPrompt", ragPrompt);
        const uniqueFilesReferenced = [
          ...new Set(searchResults.map((entry) => entry.notepath)),
        ];

        return {
          ragPrompt,
          uniqueFilesReferenced,
        };
      } catch (error) {
        console.error("Error searching database:", error);
        throw errorToString(error);
      }
    }
  );

  ipcMain.handle(
    "augment-prompt-with-flashcard-agent",
    async (
      event,
      { query, llmName }: BasePromptRequirements
    ): Promise<PromptWithRagResults> => {
      const llmSession = openAISession;
      console.log("llmName:   ", llmName);
      const llmConfig = await getLLMConfig(store, ollamaService, llmName);
      console.log("llmConfig", llmConfig);
      if (!llmConfig) {
        throw new Error(`LLM ${llmName} not configured.`);
      }

      let searchResults: DBEntry[] = [];
      const maxRAGExamples: number = store.get(StoreKeys.MaxRAGExamples);
      const windowInfo = windowManager.getWindowInfoForContents(event.sender);
      if (!windowInfo) {
        throw new Error("Window info not found.");
      }

      try {
        searchResults = await windowInfo.dbTableClient.search(
          query,
          maxRAGExamples
        );
      } catch (error) {
        searchResults = await windowInfo.dbTableClient.search(
          query,
          maxRAGExamples
        );
        console.error("Error searching database:", error);
        throw errorToString(error);
      }

      const llmGeneratedFacts = await llmSession.response(
        llmName,
        llmConfig,
        [
          {
            role: "system",
            content: `You are an experienced teacher. Help your student search and curate their notes!`,
          },
          {
            role: "user",
            content: `Extract atomic facts that can be used for students to study, based on this query: ${query}`,
          },
        ],
        store.get(StoreKeys.LLMGenerationParameters)
      );

      console.log(llmGeneratedFacts);
      const { prompt: promptToCreateFlashcardsWithAtomicFacts } =
        createPromptWithContextLimitFromContent(
          llmGeneratedFacts.choices[0].message.content || "",
          `Create useful FLASHCARDS that can be used for students to study using ONLY the context. Format is Q: <insert question> A: <insert answer>`,
          llmSession.getTokenizer(llmName),
          llmConfig.contextLength
        );
      console.log(
        "promptToCreateFlashcardsWithAtomicFacts: ",
        promptToCreateFlashcardsWithAtomicFacts
      );
      const uniqueFilesReferenced = [
        ...new Set(searchResults.map((entry) => entry.notepath)),
      ];

      return {
        ragPrompt: promptToCreateFlashcardsWithAtomicFacts,
        uniqueFilesReferenced,
      };
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
