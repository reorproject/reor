import React, { useEffect, useRef, useCallback } from 'react'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { FaSearch } from 'react-icons/fa'
import { debounce } from 'lodash'
import { DBSearchPreview } from '../File/DBResultPreview'
import { useWindowContentContext } from '@/contexts/WindowContentContext'

interface SearchComponentProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: DBQueryResult[]
  setSearchResults: (results: DBQueryResult[]) => void
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
}) => {
  const { openContent: openTabContent } = useWindowContentContext()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback(
    async (query: string) => {
      const results: DBQueryResult[] = await window.database.search(query, 50)
      setSearchResults(results)
    },
    [setSearchResults],
  )

  const debouncedSearch = useCallback(
    (query: string) => {
      const debouncedFn = debounce(() => handleSearch(query), 300)
      debouncedFn()
    },
    [handleSearch],
  )

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
    }
  }, [searchQuery, debouncedSearch])

  const openFileSelectSearch = useCallback(
    (path: string) => {
      openTabContent(path)
      posthog.capture('open_file_from_search')
    },
    [openTabContent],
  )

  return (
    <div className="h-below-titlebar overflow-y-auto overflow-x-hidden p-1">
      <div className="relative mr-1 rounded bg-neutral-800 p-2">
        <span className="absolute inset-y-0 left-0 mt-[2px] flex items-center pl-3">
          <FaSearch className="text-lg text-gray-200" size={14} />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="mr-1 mt-1 h-8 w-full rounded-md border border-transparent bg-neutral-700 pl-7 pr-5 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic search..."
        />
      </div>
      <div className="mt-2 w-full">
        {searchResults.length > 0 && (
          <div className="w-full">
            {searchResults.map((result, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <DBSearchPreview key={index} dbResult={result} onSelect={openFileSelectSearch} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchComponent
