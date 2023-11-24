import { ipcMain } from "electron";
import { RagnoteDBEntry, RagnoteTable } from "./Table";
import { createRAGPrompt } from "../Prompts/Prompts";

export const registerDBSessionHandlers = (dbTable: RagnoteTable) => {
  ipcMain.handle(
    "search",
    async (
      event,
      query: string,
      limit: number,
      filter?: string
    ): Promise<RagnoteDBEntry[]> => {
      try {
        // Assuming 'myDatabase' is your database instance with the 'search' method
        return await dbTable.search(query, limit, filter);
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
      limit: number,
      filter?: string
    ): Promise<string> => {
      try {
        // Assuming 'myDatabase' is your database instance with the 'search' method
        const searchResults = await dbTable.search(query, limit, filter);
        const prompt = createRAGPrompt(searchResults, query);
        console.log("rag augmented prompt:", prompt);
        return prompt;
      } catch (error) {
        console.error("Error searching database:", error);
        throw error;
      }
    }
  );
};
