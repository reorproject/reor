import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'
import { DatabaseSearchFilters } from '@/lib/llm/types'

export const generateTimeStampFilter = (minDate?: Date, maxDate?: Date): string => {
  let filter = ''

  if (minDate) {
    const minDateStr = minDate.toISOString().slice(0, 19).replace('T', ' ')
    filter += `filemodified > timestamp '${minDateStr}'`
  }

  if (maxDate) {
    const maxDateStr = maxDate.toISOString().slice(0, 19).replace('T', ' ')
    if (filter) {
      filter += ' AND '
    }
    filter += `filemodified < timestamp '${maxDateStr}'`
  }

  return filter
}

export const retreiveFromVectorDB = async (
  query: string,
  searchFilters: DatabaseSearchFilters,
): Promise<DBEntry[] | FileInfoWithContent[]> => {
  if (searchFilters.limit > 0) {
    const timeStampFilter = generateTimeStampFilter(searchFilters.minDate, searchFilters.maxDate)
    const dbSearchResults = await window.database.search(query, searchFilters.limit, timeStampFilter)
    if (searchFilters.passFullNoteIntoContext) {
      const uniqueNotepaths = Array.from(new Set(dbSearchResults.map((result) => result.notepath)))
      return window.fileSystem.getFiles(uniqueNotepaths)
    }
    return dbSearchResults
  }
  return []
}
