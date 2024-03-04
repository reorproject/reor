import { DBEntry } from "../database/Schema";


const TOKEN_LIMIT_MESSAGE = "The provided information is too long to process in a single prompt. Please shorten the query or provide fewer details."
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
    throw new Error(TOKEN_LIMIT_MESSAGE);
  }

  const output = basePrompt + entryContents + queryPrompt;
  return output;
}



export function createFilePrompt(
  content: string,
  query: string,
  tokenize: (text: string) => number[],
  contextLimit: number
): string {
  const basePrompt = `Answer the question below based on the following notes:\n ${content}\n`;
  const queryPrompt = `Question: ${query}`;

  const tokenCount = tokenize(basePrompt + queryPrompt).length;

  if (tokenCount >= contextLimit) {
    throw new Error(
      `The provided information is too long to process in a single prompt. Please shorten the query or shorten the file. Current token count: ${tokenCount}, Limit: ${contextLimit}`
    );
  }

  const output = basePrompt + queryPrompt;
  return output;
}

