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

// Version of chunkMarkdownByHeadings that tracks positions
export function chunkMarkdownByHeadingsWithPositions(markdownContent: string): Array<{ chunk: string; pos: number }> {
  console.log('[DEBUG-CHUNK] Starting chunking with positions')

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
    currentPos += line.length + 1 // +1 for the newline character
  })

  if (currentChunk.length) {
    chunks.push({
      chunk: currentChunk.join('\n'),
      pos: chunkStartPos,
    })
  }

  console.log('[DEBUG-CHUNK] Finished chunking, created chunks:', chunks.length)
  if (chunks.length > 0) {
    console.log('[DEBUG-CHUNK] First chunk position:', chunks[0].pos)
    console.log('[DEBUG-CHUNK] First chunk preview:', `${chunks[0].chunk.substring(0, 30)}...`)
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

// Modified version that tracks recursive string positions
export const chunkStringsRecursivelyWithPositions = async (
  stringInfos: Array<{ text: string; pos: number }>,
  _chunkSize: number,
  chunkOverlap: number,
): Promise<Array<{ chunk: string; pos: number }>> => {
  const result: Array<{ chunk: string; pos: number }> = []

  // Process all strings in parallel with Promise.all
  await Promise.all(
    stringInfos.map(async (stringInfo) => {
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: _chunkSize,
        chunkOverlap,
      })

      const chunks = await splitter.createDocuments([stringInfo.text])

      // Calculate and track the position of each sub-chunk
      let currentOffset = 0

      chunks.forEach((chunk) => {
        const chunkText = chunk.pageContent

        // Find where this chunk appears in the original text
        // Start searching from the current offset to handle repeated content
        const chunkPosition = stringInfo.text.indexOf(chunkText, currentOffset)

        if (chunkPosition !== -1) {
          // Calculate the absolute position in the document
          const absolutePosition = stringInfo.pos + chunkPosition

          // Update offset for next search to find subsequent chunks
          currentOffset = chunkPosition + 1

          console.log(
            `[DEBUG-CHUNK] Sub-chunk found at relative position ${chunkPosition}, absolute position ${absolutePosition}`,
          )

          result.push({
            chunk: chunkText,
            pos: absolutePosition,
          })
        } else {
          // Fallback if we can't find the exact position (shouldn't happen)
          console.log(
            `[DEBUG-CHUNK] Couldn't find exact position for sub-chunk, using parent position ${stringInfo.pos}`,
          )
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

// New function that returns chunks with position information
export const chunkMarkdownByHeadingsAndByCharsIfBigWithPositions = async (
  markdownContent: string,
): Promise<Array<{ chunk: string; pos: number }>> => {
  console.log('[DEBUG-CHUNK] Starting headings+chars chunking with positions')

  const chunkOverlap = 20
  const chunksByHeading = chunkMarkdownByHeadingsWithPositions(markdownContent)
  console.log('[DEBUG-CHUNK] Got chunks by heading:', chunksByHeading.length)

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

  console.log('[DEBUG-CHUNK] Big chunks to split further:', chunksWithBigChunksSplit.length)
  console.log('[DEBUG-CHUNK] Small chunks (no further splitting):', chunksWithSmallChunksSplit.length)

  const chunkedRecursively = await chunkStringsRecursivelyWithPositions(
    chunksWithBigChunksSplit,
    chunkSize,
    chunkOverlap,
  )

  console.log('[DEBUG-CHUNK] Got recursively split chunks:', chunkedRecursively.length)

  const result = chunksWithSmallChunksSplit.concat(chunkedRecursively)
  console.log('[DEBUG-CHUNK] Final chunks with positions count:', result.length)

  return result
}
