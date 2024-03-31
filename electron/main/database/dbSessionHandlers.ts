import { IpcMainInvokeEvent, ipcMain } from "electron";
import { createPromptWithContextLimitFromContent } from "../Prompts/Prompts";
import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";
import { ollamaService, openAISession } from "../llm/llmSessionHandlers";
import { OpenAILLMConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
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

  const getFilteredResults = async (
    event: IpcMainInvokeEvent,
    query: string,
    filter?: string
  ) => {
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
    const filteredResults = searchResults.filter(
      (entry) => entry._distance < MAX_COSINE_DISTANCE
    );

    return filteredResults;
  };

  ipcMain.handle(
    "augment-prompt-with-rag",
    async (
      event,
      query: string,
      llmName: string,
      filter?: string
    ): Promise<PromptWithRagResults> => {
      try {
        const llmSession = openAISession;
        const llmConfig = await getLLMConfig(store, ollamaService, llmName);
        console.log("llmConfig", llmConfig);
        if (!llmConfig) {
          throw new Error(`LLM ${llmName} not configured.`);
        }
        const filteredResults = await getFilteredResults(event, query, filter);

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
    "augment-prompt-to-flashcards-with-rag",
    async (
      event,
      query: string,
      llmName: string
    ): Promise<PromptWithRagResults> => {
      const llmSession = openAISession;
      const llmConfig = await getLLMConfig(store, ollamaService, llmName);

      // step 1: retreive data relevant to the query
      const filteredResults = await getFilteredResults(event, query);

      console.log("llmConfig", llmConfig);
      if (!llmConfig) {
        throw new Error(`LLM ${llmName} not configured.`);
      }

      // step 2: generate atomic facts from the filtered results
      const llmFacts = await llmSession.response(
        llmName,
        llmConfig as OpenAILLMConfig,
        [
          {
            role: "system",
            content: `You are an experienced teacher, and you will translate notes into atomic facts
              
                Below is an example:
                
                Example Note:
                "Patient complains of chest pain, sharp in nature, exacerbated by deep breathing and lying flat. No associated symptoms of shortness of breath or palpitations. No relevant past medical history. Physical exam reveals localized tenderness upon palpation of the chest wall. ECG shows no acute changes. Likely diagnosis: Costochondritis."
                 
                Example facts extracted:
                Chief complaint: Chest pain
                Pain nature: Sharp
                Aggravating factors: Deep breathing, lying flat
                Associated symptoms: None
                Past medical history: None
                Physical exam findings: Localized tenderness on chest wall palpation
                ECG findings: No acute changes
                Likely diagnosis: Costochondritis`,
          },
          {
            role: "user",
            content: `${query} 
              Using the results from : ${filteredResults
                .map((result) => result.content)
                .join("\n ")}
                  `,
          },
        ],
        store.get(StoreKeys.LLMGenerationParameters)
      );

      try {
        const windowInfo = windowManager.getWindowInfoForContents(event.sender);
        if (!windowInfo) {
          throw new Error("Window info not found.");
        }

        const llmAtomicFacts = llmFacts.choices[0].message.content ?? "";
        // step 3: create flashcards using the atomic facts
        const { prompt: ragPrompt } = createPromptWithContextLimitFromContent(
          llmAtomicFacts,
          "Genenerate valid questions-answer pairs from the atomic facts above as answers",
          llmSession.getTokenizer(llmName),
          llmConfig.contextLength
        );

        console.log("ragPrompt", ragPrompt);

        return {
          ragPrompt,
          uniqueFilesReferenced: [],
        };
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
