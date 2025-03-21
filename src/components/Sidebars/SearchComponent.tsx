import React, { useEffect, useRef, useCallback, useState } from 'react'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { FaSearch } from 'react-icons/fa'
import { debounce } from 'lodash'
import { BiFilterAlt } from 'react-icons/bi'
import { DBSearchPreview } from '../File/DBResultPreview'
import { useContentContext } from '@/contexts/ContentContext'
import { hybridSearch } from '@/lib/db'

interface SearchComponentProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: DBQueryResult[]
  setSearchResults: (results: DBQueryResult[]) => void
}

export type SearchModeTypes = "vector" | "hybrid"

interface SearchParamsType {
  searchMode: SearchModeTypes
  vectorWeight: number
}

// Custom toggle component
const ToggleSwitch: React.FC<{
  isHybrid: boolean
  onChange: (searchMode: SearchModeTypes) => void
  className?: string
  label: string
}> = ({ isHybrid, onChange, className = '', label }) => (
  <button
    type="button"
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      isHybrid ? 'bg-blue-500' : 'bg-gray-600'
    } ${className}`}
    onClick={() => onChange(isHybrid ? 'vector' : 'hybrid')}
    aria-checked={isHybrid}
    role="switch"
    aria-label={label}
  >
    <span className="sr-only">{label}</span>
    <span
      className={`inline-block size-3.5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
        isHybrid ? 'translate-x-[18px]' : 'translate-x-[2px]'
      }`}
    />
  </button>
)

const SearchComponent: React.FC<SearchComponentProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
}) => {
  const { openContent: openTabContent } = useContentContext()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchParams, setSearchParams] = useState<SearchParamsType>({
    searchMode: 'vector',
    vectorWeight: 0.7,
  })
  const [showSearchOptions, setShowSearchOptions] = useState(false)

  // Fetches search mode on launch
  useEffect(() => {
    const fetchSearchMode = async () => {
      const storedParams = await window.electronStore.getSearchParams()
      if (storedParams) setSearchParams(storedParams)
    }
    fetchSearchMode()
  }, [])

  // Sets the search mode whenever it changes
  useEffect(() => {
    window.electronStore.setSearchParams(searchParams)
  }, [searchParams])

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }

      if (searchParams.searchMode === 'hybrid') {
        const results = await hybridSearch(query, 50, undefined, searchParams.vectorWeight)
        setSearchResults(results)
      } else {
        const results: DBQueryResult[] = await window.database.search(query, 50)
        setSearchResults(results)
      }
    },
    [setSearchResults, searchParams.searchMode, searchParams.vectorWeight],
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
  }, [searchParams.searchMode, searchParams.vectorWeight, debouncedSearch, searchQuery])

  const openFileSelectSearch = useCallback(
    (path: string) => {
      openTabContent(path)
      posthog.capture('open_file_from_search')
    },
    [openTabContent],
  )

  const handleVectorWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => ({
      ...prev,
      vectorWeight: parseFloat(event.target.value),
    }))
  }

  return (
    <div className="h-below-titlebar overflow-y-auto overflow-x-hidden p-1">
      <div className="relative mr-1 rounded bg-neutral-800 p-2">
        <span className="absolute inset-y-0 left-0 mt-[2px] flex items-center pl-3">
          <FaSearch className="text-lg text-gray-200" size={14} />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="mr-1 mt-1 h-8 w-full rounded-md border border-transparent bg-neutral-700 pl-7 pr-10 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchParams.searchMode ? 'Hybrid search...' : 'Semantic search...'}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 mt-1 flex items-center bg-transparent p-1 pr-3 text-neutral-500 hover:text-white focus:outline-none"
          onClick={() => setShowSearchOptions(!showSearchOptions)}
          aria-label="Search options"
        >
          <BiFilterAlt size={16} />
        </button>
      </div>

      {showSearchOptions && (
        <div className="mt-2 rounded border border-gray-600 bg-neutral-800 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-200">Hybrid Search</span>
            <ToggleSwitch 
              isHybrid={searchParams.searchMode === 'hybrid'} 
              onChange={(mode) => setSearchParams((prev) => ({ ...prev, searchMode: mode }))} 
              label="Hybrid Search" 
            />
          </div>

          {searchParams.searchMode === 'hybrid' && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-200">Search Balance</div>
                <span className="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300">
                  {Math.round(searchParams.vectorWeight * 100)}% Semantic - {Math.round((1 - searchParams.vectorWeight) * 100)}% Keywords
                </span>
              </div>
              <div className="relative">
                <input
                  id="vector-weight-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={searchParams.vectorWeight}
                  onChange={handleVectorWeightChange}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
                  aria-label="Search balance slider"
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-gray-400">
                <span>Keywords</span>
                <span>Balanced</span>
                <span>Semantic</span>
              </div>
            </div>
          )}
        </div>
      )}

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
