import Store from 'electron-store'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

import { StoreKeys, StoreSchema } from '../electron-store/storeConfig'

// Chunk by markdown headings and then use Langchain chunker if the heading chunk is too big:
const store = new Store<StoreSchema>()

const chunkSize = store.get(StoreKeys.ChunkSize)

export function chunkMarkdownByHeadings(markdownContent: string): string[] {
  const lines = markdownContent.split('\n')
  const chunks: string[] = []
  let currentChunk: string[] = []

  lines.forEach((line) => {
    if (line.startsWith('#')) {
      if (currentChunk.length) {
        chunks.push(currentChunk.join('\n'))
        currentChunk = []
      }
    }
    currentChunk.push(line)
  })

  if (currentChunk.length) {
    chunks.push(currentChunk.join('\n'))
  }
  return chunks
}

export function chunkMarkdownByHeadingsWithPositions(markdownContent: string): Array<{ chunk: string; pos: number }> {
  const lines = markdownContent.split('\n')
  const chunks: Array<{ chunk: string; pos: number }> = []
  let currentChunk: string[] = []
  let currentPos = 0
  let chunkStartPos = 0

  lines.forEach((line) => {
    if (line.startsWith('#')) {
      if (currentChunk.length) {
        chunks.push({
          chunk: currentChunk.join('\n'),
          pos: chunkStartPos,
        })
        currentChunk = []
        chunkStartPos = currentPos
      } else {
        chunkStartPos = currentPos
      }
    }
    currentChunk.push(line)
    currentPos += line.length + 1
  })

  if (currentChunk.length) {
    chunks.push({
      chunk: currentChunk.join('\n'),
      pos: chunkStartPos,
    })
  }

  return chunks
}

export const chunkStringsRecursively = async (
  strings: string[],
  _chunkSize: number,
  chunkOverlap: number,
): Promise<string[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: _chunkSize,
    chunkOverlap,
  })

  const chunks = await splitter.createDocuments(strings)
  const mappedChunks = chunks.map((chunk) => chunk.pageContent)
  return mappedChunks
}

export const chunkStringsRecursivelyWithPositions = async (
  stringInfos: Array<{ text: string; pos: number }>,
  _chunkSize: number,
  chunkOverlap: number,
): Promise<Array<{ chunk: string; pos: number }>> => {
  const result: Array<{ chunk: string; pos: number }> = []

  await Promise.all(
    stringInfos.map(async (stringInfo) => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: _chunkSize,
        chunkOverlap,
      })

      const chunks = await splitter.createDocuments([stringInfo.text])

      let currentOffset = 0

      chunks.forEach((chunk) => {
        const chunkText = chunk.pageContent

        // Find where this chunk appears in the original text
        // Start searching from the current offset to handle repeated content
        const chunkPosition = stringInfo.text.indexOf(chunkText, currentOffset)

        if (chunkPosition !== -1) {
          const absolutePosition = stringInfo.pos + chunkPosition

          currentOffset = chunkPosition + 1

          result.push({
            chunk: chunkText,
            pos: absolutePosition,
          })
        } else {
          // Fallback if we can't find the exact position (shouldn't happen)

          result.push({
            chunk: chunkText,
            pos: stringInfo.pos,
          })
        }
      })
    }),
  )

  return result
}

export const chunkMarkdownByHeadingsAndByCharsIfBig = async (markdownContent: string): Promise<string[]> => {
  const chunkOverlap = 20
  const chunksByHeading = chunkMarkdownByHeadings(markdownContent)

  const chunksWithBigChunksSplit: string[] = []
  const chunksWithSmallChunksSplit: string[] = []
  chunksByHeading.forEach((chunk) => {
    if (chunk.length > chunkSize) {
      chunksWithBigChunksSplit.push(chunk)
    } else {
      chunksWithSmallChunksSplit.push(chunk)
    }
  })

  const chunkedRecursively = await chunkStringsRecursively(chunksWithBigChunksSplit, chunkSize, chunkOverlap)

  return chunksWithSmallChunksSplit.concat(chunkedRecursively)
}

export const chunkMarkdownByHeadingsAndByCharsIfBigWithPositions = async (
  markdownContent: string,
): Promise<Array<{ chunk: string; pos: number }>> => {
  const chunkOverlap = 20
  const chunksByHeading = chunkMarkdownByHeadingsWithPositions(markdownContent)

  const chunksWithBigChunksSplit: Array<{ text: string; pos: number }> = []
  const chunksWithSmallChunksSplit: Array<{ chunk: string; pos: number }> = []

  chunksByHeading.forEach((chunkInfo) => {
    if (chunkInfo.chunk.length > chunkSize) {
      chunksWithBigChunksSplit.push({
        text: chunkInfo.chunk,
        pos: chunkInfo.pos,
      })
    } else {
      chunksWithSmallChunksSplit.push(chunkInfo)
    }
  })

  const chunkedRecursively = await chunkStringsRecursivelyWithPositions(
    chunksWithBigChunksSplit,
    chunkSize,
    chunkOverlap,
  )

  const result = chunksWithSmallChunksSplit.concat(chunkedRecursively)

  return result
}
