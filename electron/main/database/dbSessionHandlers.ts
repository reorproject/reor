import { ipcMain } from "electron";
import { DBEntry, LanceDBTableWrapper } from "./LanceTableWrapper";
import { createRAGPrompt } from "../Prompts/Prompts";
import { DatabaseFields } from "./Schema";

export const registerDBSessionHandlers = (dbTable: LanceDBTableWrapper) => {
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
      numberOfContextItems: number,
      filter?: string
    ): Promise<string> => {
      try {
        // Assuming 'myDatabase' is your database instance with the 'search' method
        const searchResults = await dbTable.search(
          query,
          numberOfContextItems,
          filter
        );
        const prompt = createRAGPrompt(searchResults, query);
        console.log("rag augmented prompt:", prompt);
        return prompt;
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
