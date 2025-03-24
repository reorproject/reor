/* eslint-disable no-underscore-dangle */
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry, DBQueryResult } from 'electron/main/vector-database/schema'
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

interface KeywordDBQueryResult extends DBQueryResult {
  keyword_score?: number
}

const keywordSearch = async (query: string, limit: number, filter?: string): Promise<KeywordDBQueryResult[]> => {
  try {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 2 && !['the', 'and', 'for', 'with', 'this', 'that'].includes(word))

    if (keywords.length === 0) {
      return []
    }

    const vectorResults = await window.database.search(query, limit, filter)

    const escapedKeywords = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const keywordRegex = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi')

    const resultsWithKeywordScores = vectorResults
      .map((result) => {
        const matches = result.content.matchAll(keywordRegex)
        const score = Array.from(matches).length
        return {
          ...result,
          keyword_score: score,
        }
      })
      .sort((a, b) => (b.keyword_score || 0) - (a.keyword_score || 0))

    return resultsWithKeywordScores
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error performing keyword search:', error)
    return []
  }
}

const combineAndRankResults = (
  vectorResults: DBQueryResult[],
  keywordResults: KeywordDBQueryResult[],
  limit: number,
  vectorWeight = 0.7,
): DBQueryResult[] => {
  const keywordWeight = 1 - vectorWeight
  const resultsMap = new Map<string, DBQueryResult & { combinedScore: number; keywordScore?: number }>()

  const maxKeywordScore = keywordResults.length > 0 ? Math.max(...keywordResults.map((r) => r.keyword_score || 0)) : 0

  vectorResults.forEach((result) => {
    const key = `${result.notepath}-${result.subnoteindex}`
    const vectorScore = 1 - result._distance

    resultsMap.set(key, {
      ...result,
      combinedScore: vectorScore * vectorWeight,
    })
  })

  keywordResults.forEach((result) => {
    const key = `${result.notepath}-${result.subnoteindex}`

    // Normalize keyword score to 0-1 range
    const normalizedKeywordScore = maxKeywordScore > 0 ? (result.keyword_score || 0) / maxKeywordScore : 0

    const keywordScoreComponent = normalizedKeywordScore * keywordWeight

    if (resultsMap.has(key)) {
      const existingEntry = resultsMap.get(key)!
      existingEntry.combinedScore += keywordScoreComponent
      existingEntry.keywordScore = result.keyword_score
    } else {
      resultsMap.set(key, {
        ...result,
        _distance: 1 - keywordScoreComponent,
        combinedScore: keywordScoreComponent,
        keywordScore: result.keyword_score,
      })
    }
  })

  // Convert map to array, sort by combined score, and take top results
  const finalResults = Array.from(resultsMap.values())
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit)
    .map((entry) => {
      const updatedEntry = { ...entry }

      // When vectorWeight is 0 (all keywords), display keyword score as similarity instead
      if (vectorWeight === 0) {
        // Handle the case where we're using 100% keyword search
        if (entry.keywordScore !== undefined && maxKeywordScore > 0) {
          const normalizedScore = entry.keywordScore / maxKeywordScore
          updatedEntry._distance = 1 - normalizedScore
        } else {
          updatedEntry._distance = 0.99 // Show at least 1% similarity
        }
      } else {
        updatedEntry._distance = 1 - entry.combinedScore
      }

      return updatedEntry
    })

  return finalResults
}

export const hybridSearch = async (
  query: string,
  limit: number,
  filter?: string,
  vectorWeight = 0.7,
): Promise<DBQueryResult[]> => {
  try {
    const [vectorResults, keywordResults] = await Promise.all([
      window.database.search(query, limit, filter),

      keywordSearch(query, limit, filter),
    ])

    return combineAndRankResults(vectorResults, keywordResults, limit, vectorWeight)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error performing hybrid search:', error)
    return window.database.search(query, limit, filter)
  }
}
