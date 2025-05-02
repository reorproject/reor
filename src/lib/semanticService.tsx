import { DBQueryResult } from 'electron/main/vector-database/schema'
import removeMd from 'remove-markdown'

export async function getSanitizedChunk(filePath: string | null): Promise<string | undefined> {
  if (!filePath) {
    return undefined
  }
  const fileContent: string = await window.fileSystem.readFile(filePath, 'utf-8')
  if (!fileContent) {
    return undefined
  }
  const sanitizedText = removeMd(fileContent.slice(0, 500))
  return sanitizedText
}

export async function getSimilarFiles(filePath: string | null, limit: number = 20): Promise<DBQueryResult[]> {
  if (!filePath) {
    return []
  }

  const sanitizedText = await getSanitizedChunk(filePath)
  if (!sanitizedText) {
    return []
  }

  const databaseFields = await window.database.getDatabaseFields()
  const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`

  const searchResults: DBQueryResult[] = await window.database.search(sanitizedText, limit, filterString)

  return searchResults
}
