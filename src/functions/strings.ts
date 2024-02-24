export function removeFileExtension(filename: string): string {
  if (!filename || filename.indexOf(".") === -1) {
    return filename;
  }

  if (filename.startsWith(".") && filename.lastIndexOf(".") === 0) {
    return filename;
  }

  return filename.substring(0, filename.lastIndexOf("."));
}

export const getInvalidCharacterInFileName = (filename: string): string | null => {
  const invalidCharacters = /[/\\|"';:.?$%*<>=\s]/;
  const idx = filename.search(invalidCharacters);

  return idx === -1 ? null : filename[idx];
}
