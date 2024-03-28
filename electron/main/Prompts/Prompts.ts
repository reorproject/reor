import { DBEntry } from "../database/Schema";
export interface PromptWithContextLimit {
  prompt: string;
  contextCutoffAt?: string;
}

export function createPromptWithContextLimitFromContent(
  content: string | DBEntry[],
  query: string,
  tokenize: (text: string) => number[],
  contextLimit: number
): PromptWithContextLimit {
  const basePrompt =
    "Answer the question below based on the following notes:\n ";
  const queryPrompt = `Question: ${query}`;
  let tokenCount = tokenize(queryPrompt + basePrompt).length;

  const contentArray: string[] = [];
  let cutOffLine: string = "";
  const contents =
    typeof content === "string"
      ? content.split("\n")
      : content.map((entry) => entry.content);

  for (const line of contents) {
    const lineWithNewLine = line + "\n";
    if (tokenize(lineWithNewLine).length + tokenCount < contextLimit) {
      tokenCount += tokenize(lineWithNewLine).length;
      contentArray.push(lineWithNewLine);
    } else if (cutOffLine.length === 0) {
      cutOffLine = lineWithNewLine;
    }
  }

  const outputPrompt = basePrompt + contentArray.join("") + queryPrompt;

  return {
    prompt: outputPrompt,
    contextCutoffAt: cutOffLine || undefined,
  };
}
