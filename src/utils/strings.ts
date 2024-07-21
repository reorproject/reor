import nspell from 'nspell'

const affPath = '/dictionaries/en_US/en_US.aff'
const dicPath = '/dictionaries/en_US/en_US.dic'

let dictionary: nspell | null = null

async function loadDictionary() {
  try {
    // Fetch dictionary files
    const affData = await fetch(affPath).then((res) => res.text())
    const dicData = await fetch(dicPath).then((res) => res.text())

    dictionary = nspell({ aff: affData, dic: dicData })
  } catch (error) {
    // Do not throw error
  }
}

async function ensureDictionaryLoaded() {
  if (!dictionary) await loadDictionary()
}

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
      invalidCharacters = /["*:<>?|]/
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
  let invalidCharacters: RegExp
  const platform = await window.electronUtils.getPlatform()

  switch (platform) {
    case 'win32':
      invalidCharacters = /["*/:<>?\\|]/
      break
    case 'darwin':
      invalidCharacters = /[/:]/
      break
    default:
      invalidCharacters = /[/]/
      break
  }

  const idx = filename.search(invalidCharacters)

  return idx === -1 ? null : filename[idx]
}

export async function isSpeltCorrectly(word: string): Promise<boolean> {
  await ensureDictionaryLoaded()
  if (!dictionary) return false
  return word ? dictionary.correct(word) : false
}

export async function getListOfSuggestions(word: string, limit: number = 0): Promise<string[]> {
  await ensureDictionaryLoaded()
  if (!dictionary) return []
  const suggestions: string[] = dictionary.suggest(word)
  return suggestions.slice(0, limit)
}
