import { DBEntry } from "../database/Schema";

export function createRAGPrompt(entries: DBEntry[], query: string): string {
  // Concatenate the content of each entry
  const contents = entries.map((entry) => entry.content).join(" ");

  // Combine the contents with the query to form the final prompt
  const prompt = `Answer the question below based on the following notes:
${contents}
Question: ${query}`;

  return prompt;
}
