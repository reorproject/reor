import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'
import { parse, isValid, format } from 'date-fns'
import { DatabaseSearchFilters } from '@/lib/llm/types'

export const generateTimeStampFilter = (minDate?: Date | string, maxDate?: Date | string): string => {
  let filter = ''

  const parseDate = (date: Date | string): string => {
    if (date instanceof Date) {
      return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
    }
    if (typeof date === 'string') {
      const parsedDate = parse(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date())
      if (isValid(parsedDate)) {
        return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      }
    }
    throw new Error('Invalid date format. Please use ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ')
  }

  if (minDate) {
    const minDateStr = parseDate(minDate)
    filter += `filemodified > timestamp '${minDateStr}'`
  }

  if (maxDate) {
    const maxDateStr = parseDate(maxDate)
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
