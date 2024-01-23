import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const chunkMarkdownByHeadingsAndByCharsIfBig = async (
  markdownContent: string
): Promise<string[]> => {
  const chunkSize = 400;
  const chunkOverlap = 20;
  const chunksByHeading = chunkMarkdownByHeadings(markdownContent);

  // it doesn't matter the order of the chunks so we should just split by those which are above our chunk size and those below our chunk size:
  const chunksWithBigChunksSplit: string[] = [];
  const chunksWithSmallChunksSplit: string[] = [];
  chunksByHeading.forEach((chunk) => {
    if (chunk.length > chunkSize) {
      chunksWithBigChunksSplit.push(chunk);
    } else {
      chunksWithSmallChunksSplit.push(chunk);
    }
  });
  // console.log("chunksWithBigChunksSplit: ", chunksWithBigChunksSplit);
  // then we can split the big chunks by characters:
  const chunkedRecursively = await chunkStringsRecursively(
    chunksWithBigChunksSplit,
    chunkSize,
    chunkOverlap
  );

  // then we can return the two arrays concatenated:
  return chunksWithSmallChunksSplit.concat(chunkedRecursively);
};

export function chunkMarkdownByHeadings(markdownContent: string): string[] {
  const lines = markdownContent.split("\n");
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("#")) {
      if (currentChunk.length) {
        chunks.push(currentChunk.join("\n"));
        currentChunk = [];
      }
    }
    currentChunk.push(line);
  });

  // Add the last chunk if it exists
  if (currentChunk.length) {
    chunks.push(currentChunk.join("\n"));
  }
  return chunks;
}

const chunkStringsRecursively = async (
  strings: string[],
  chunkSize: number,
  chunkOverlap: number
): Promise<string[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
  });

  const chunks = await splitter.createDocuments(strings);
  const mappedChunks = chunks.map((chunk) => chunk.pageContent);
  return mappedChunks;
};
