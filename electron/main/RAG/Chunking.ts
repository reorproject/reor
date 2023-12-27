export function chunkMarkdownByHeadings(markdownContent: string): string[] {
  const lines = markdownContent.split("\n");
  const chunks: string[] = [];
  let currentChunk: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("#")) {
      // Detects markdown headings
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
