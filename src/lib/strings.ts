export function removeFileExtension(filename: string): string {
  if (!filename || filename.indexOf('.') === -1) {
    return filename
  }

  if (filename.startsWith('.') && filename.lastIndexOf('.') === 0) {
    return filename
  }

  return filename.substring(0, filename.lastIndexOf('.'))
}

export const getInvalidCharacterInFilePath = async (filename: string): Promise<string | null> => {
  let invalidCharacters: RegExp
  const platform = await window.electronUtils.getPlatform()

  switch (platform) {
    case 'win32':
      invalidCharacters = /["*<>?|]/
      break
    case 'darwin':
      invalidCharacters = /[:]/
      break
    default:
      invalidCharacters = /$^/
      break
  }

  const idx = filename.search(invalidCharacters)

  return idx === -1 ? null : filename[idx]
}

export const getInvalidCharacterInFileName = async (filename: string): Promise<string | null> => {
  // eslint-disable-next-line no-useless-escape
  const invalidCharacters = /[<>:"\/\\|?*\.\[\]\{\}!@#$%^&()+=,;'`~]/

  // Check if the filename contains any invalid characters
  const match = filename.match(invalidCharacters)
  return match ? match[0] : null
}

export const generateFileName = (filename: string): string => {
  return `${filename
    .split('\n')[0]
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .substring(0, 20)}.md`
}
