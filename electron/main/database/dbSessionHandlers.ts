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
      // So I guess...We'll just need to refactor this into something that like a function which takes as input a session, a query, and a max number of context items.
      // And then, we make a search for the max context items and then have a function that starts cutting down the context
      try {
        let searchResults: DBEntry[] = [];
        // return query;
        // get max context length from electron store
        const maxRAGExamples: number = store.get(StoreKeys.MaxRAGExamples);
        console.log("max context length:", maxRAGExamples);
        if (maxRAGExamples && maxRAGExamples > 0) {
          searchResults = await dbTable.search(query, maxRAGExamples, filter);
        } else {
          throw new Error("Max RAG examples is not set or is invalid.");
        }
        // wait 10 seconds:
        // await new Promise((resolve) => setTimeout(resolve, 10000));
        // ok now with search results, we should perhaps check whether we get back the llm session + what happens if context length is empty
        const llmSession = LLMSessions[llmSessionID];
        if (!llmSession) {
          throw new Error(`Session ${llmSessionID} does not exist.`);
        }

        // console.log("llmSession:", llmSession);
        // ok so now that we have this session, perhaps we can pass in the tokenizer function and token limit to this create rag prompt and just go from there.

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
    // event.reply("database-fields-response", DatabaseFields);
    return DatabaseFields;
  });
};
