import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'
import { SearchFilters } from '@/components/Chat/types'

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
  searchFilters: SearchFilters,
): Promise<DBEntry[] | FileInfoWithContent[]> => {
  if (searchFilters.limit > 0) {
    const timeStampFilter = generateTimeStampFilter(searchFilters.minDate, searchFilters.maxDate)
    const dbSearchResults = await window.database.search(query, searchFilters.limit, timeStampFilter)

    if (searchFilters.passFullNoteIntoContext) {
      return window.fileSystem.getFiles(dbSearchResults.map((result) => result.notepath))
    }
    return dbSearchResults.map((result) => {
      const { vector, ...rest } = result
      return rest
    })
  }
  return []
}
