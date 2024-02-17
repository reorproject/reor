import { DBEntry } from "../database/Schema";

export function createRAGPrompt(
  entries: DBEntry[],
  query: string,
  tokenize: (text: string) => number[],
  contextLimit: number
): string {
  let entryContents = "";

  const basePrompt = `Answer the question below based on the following notes:\n`;
  const queryPrompt = `Question: ${query}`;

  let tokenCount = tokenize(basePrompt + queryPrompt).length;
  for (const entry of entries) {
    const tempEntryContent = `${entryContents}${entry.content}\n`;
    const tempPrompt = basePrompt + tempEntryContent + queryPrompt;
    const tempTokenCount = tokenize(tempPrompt).length;
    if (tempTokenCount <= contextLimit) {
      entryContents = tempEntryContent;
      tokenCount = tempTokenCount;
    } else {
      break;
    }
  }

  if (tokenCount >= contextLimit) {
    throw new Error(
      "The provided information is too long to process in a single prompt. Please shorten the query or provide fewer details."
    );
  }

  const output = basePrompt + entryContents + queryPrompt;
  return output;
}
