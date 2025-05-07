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
  const store = useSemanticCache.getState()
  const { getSemanticData, setSemanticData, shouldRefetch } = store
  if (!shouldRefetch(filePath)) {
    return getSemanticData(filePath).data // We've already fetched this recently
  }
 
  store.setFetching(filePath, true)
  const sanitizedText = await getSanitizedChunk(filePath)
  if (!sanitizedText) {
    store.setFetching(filePath, false)
    return []
  }

  const databaseFields = await window.database.getDatabaseFields()
  const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`

  const searchResults: DBQueryResult[] = await window.database.search(sanitizedText, limit, filterString)

  setSemanticData(filePath, searchResults)
  return searchResults
}

/**
 * Gets all of the unique files for a specific file path.
 * 
 * @param filePath Filepath we want to fetch similar files for
 * @param limit How many files we want to search for
 * @returns 
 */
export async function getUniqueSimilarFiles(filePath: string | null, limit: number = 20): Promise<DBQueryResult[]> {
  const results = await getSimilarFiles(filePath, limit)
  const seen = new Set<string>()
  const deduped = results.filter(row => {
    if (seen.has(row.notepath)) return false
    seen.add(row.notepath)
    return true
  })
  return deduped
}

// useSemanticCache.getState().setSemanticData(filePath, await getSimilarFiles(filePath))
export async function setSimilarFiles(filePath: string | null): Promise<void> {
  if (!filePath) {
    return
  }
  const { setSemanticData } = useSemanticCache.getState()
  setSemanticData(filePath, await getSimilarFiles(filePath))
}