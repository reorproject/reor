import { RagnoteDBEntry } from "../database/Table";

export function createRAGPrompt(
  entries: RagnoteDBEntry[],
  query: string
): string {
  // Concatenate the content of each entry
  const contents = entries.map((entry) => entry.content).join(" ");

  // Combine the contents with the query to form the final prompt
  const prompt = `${contents} ${query}`;

  return prompt;
}
