import { DBEntry } from '../vector-database/schema'

export interface PromptWithContextLimit {
  prompt: string
  contextCutoffAt?: string
}

export const createPromptWithContextLimitFromContent = (
  content: string | DBEntry[],
  basePrompt: string,
  query: string,
  tokenize: (text: string) => number[],
  contextLimit: number,
): PromptWithContextLimit => {
  const initialTokenCount = tokenize(query + basePrompt).length
  const contents = Array.isArray(content) ? content.map((entry) => entry.content) : content.split('\n')

  const { contentArray, cutOffLine } = contents.reduce<{
    contentArray: string[]
    tokenCount: number
    cutOffLine: string
  }>(
    ({ contentArray: _contentArray, tokenCount, cutOffLine: _cutOffLine }, line) => {
      const lineWithNewLine = `${line}\n`
      const lineTokens = tokenize(lineWithNewLine).length

      if (lineTokens + tokenCount < contextLimit * 0.9) {
        return {
          contentArray: [..._contentArray, lineWithNewLine],
          tokenCount: tokenCount + lineTokens,
          cutOffLine: _cutOffLine,
        }
      }
      if (_cutOffLine.length === 0) {
        return { contentArray: _contentArray, tokenCount, cutOffLine: lineWithNewLine }
      }
      return { contentArray: _contentArray, tokenCount, cutOffLine: _cutOffLine }
    },
    { contentArray: [], tokenCount: initialTokenCount, cutOffLine: '' },
  )

  const outputPrompt = basePrompt + contentArray.join('') + query
  return {
    prompt: outputPrompt,
    contextCutoffAt: cutOffLine || undefined,
  }
}
