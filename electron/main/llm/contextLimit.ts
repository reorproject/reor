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
