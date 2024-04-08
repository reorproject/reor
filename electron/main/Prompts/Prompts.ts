import { DBEntry } from "../database/Schema";
export interface PromptWithContextLimit {
  prompt: string;
  contextCutoffAt?: string;
}

export function createPromptWithContextLimitFromContent(
  content: string | DBEntry[],
  basePrompt: string,
  query: string,
  tokenize: (text: string) => number[],
  contextLimit: number
): PromptWithContextLimit {
  let tokenCount = tokenize(query + basePrompt).length;

  const contentArray: string[] = [];
  let cutOffLine: string = "";
  const contents =
    typeof content === "string"
      ? content.split("\n")
      : content.map((entry) => entry.content);

  for (const line of contents) {
    const lineWithNewLine = line + "\n";
    if (tokenize(lineWithNewLine).length + tokenCount < contextLimit * 0.9) {
      tokenCount += tokenize(lineWithNewLine).length;
      contentArray.push(lineWithNewLine);
    } else if (cutOffLine.length === 0) {
      cutOffLine = lineWithNewLine;
    }
  }

  const outputPrompt = basePrompt + contentArray.join("") + query;

  return {
    prompt: outputPrompt,
    contextCutoffAt: cutOffLine || undefined,
  };
}
