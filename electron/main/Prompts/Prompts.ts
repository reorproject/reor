import { DBEntry } from "../database/LanceTableWrapper";

export function createRAGPrompt(entries: DBEntry[], query: string): string {
  // Concatenate the content of each entry
  const contents = entries.map((entry) => entry.content).join(" ");

  // Combine the contents with the query to form the final prompt
  const prompt = `Given the following notes:
  ### Notes start ###
  ${contents}
  ### Notes end ###
  Answer the following user query responding directly to the user:
   ${query}`;

  return prompt;
}
