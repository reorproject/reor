export function removeFileExtension(filename: string): string {
  if (!filename || filename.indexOf(".") === -1) {
    return filename;
  }

  if (filename.startsWith(".") && filename.lastIndexOf(".") === 0) {
    return filename;
  }

  return filename.substring(0, filename.lastIndexOf("."));
}

export const getInvalidCharacterInFileName = async (filename: string): Promise<string | null> => {
  let invalidCharacters: RegExp;
  const platform = await window.electron.getPlatform();

  switch (platform) {
    case 'win32':
      invalidCharacters = /["*/:<>?\\|]/;
      break;
    case 'darwin':
      invalidCharacters = /[/:]/;
      break;
    default:
      invalidCharacters = /[/]/;
      break;
  }

  const idx = filename.search(invalidCharacters);

  return idx === -1 ? null : filename[idx];
}
