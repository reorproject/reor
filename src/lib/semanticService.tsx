import { DBQueryResult } from 'electron/main/vector-database/schema'
import removeMd from 'remove-markdown'
import { useSemanticCache } from '@/lib/utils'

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
  const { getSemanticData, setSemanticData, shouldRefetch } = useSemanticCache.getState()
  if (!shouldRefetch(filePath)) {
    console.log(`Using cached similar files for ${filePath}`)
    return getSemanticData(filePath).data // We've already fetched this recently
  }
  console.log(`Fetching new similar files for ${filePath}`)
  const sanitizedText = await getSanitizedChunk(filePath)
  if (!sanitizedText) {
    return []
  }

  const databaseFields = await window.database.getDatabaseFields()
  const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`

  const searchResults: DBQueryResult[] = await window.database.search(sanitizedText, limit, filterString)

  setSemanticData(filePath, searchResults)
  return searchResults
}

export function getCachedSimilarFiles(filePath: string | null): DBQueryResult[] {
  if (!filePath) {
    return []
  }
  const { getSemanticData } = useSemanticCache.getState()
  return getSemanticData(filePath).data
}

// useSemanticCache.getState().setSemanticData(filePath, await getSimilarFiles(filePath))
export async function setSimilarFiles(filePath: string | null): Promise<void> {
  if (!filePath) {
    return
  }
  const { setSemanticData } = useSemanticCache.getState()
  setSemanticData(filePath, await getSimilarFiles(filePath))
}