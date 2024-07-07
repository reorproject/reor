import { DBEntry } from "../vector-database/schema";
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

export function sliceListOfStringsToContextLength(
  strings: string[],
  tokenize: (text: string) => number[],
  contextLimit: number
): string[] {
  let tokenCount = 0;
  const result: string[] = [];

  for (const string of strings) {
    const tokens = tokenize(string);
    const newTokenCount = tokenCount + tokens.length;
    if (newTokenCount > contextLimit) break;
    result.push(string);
    tokenCount = newTokenCount;
  }

  return result;
}

export function sliceStringToContextLength(
  inputString: string,
  tokenize: (text: string) => number[],
  contextLimit: number
): string {
  let tokenCount = 0;
  let result = "";

  // Split the input string into segments that are likely to be tokenized.
  // This assumes a whitespace tokenizer; adjust the split logic as needed for your tokenizer.
  const segments = inputString.split(/(\s+)/);

  for (const segment of segments) {
    const tokens = tokenize(segment);
    const newTokenCount = tokenCount + tokens.length;

    if (newTokenCount > contextLimit) break;

    result += segment;
    tokenCount = newTokenCount;
  }

  return result;
}
