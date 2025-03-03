/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useCallback } from 'react'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { debounce } from 'lodash'
import { Input, XStack, YStack, ScrollView } from 'tamagui'
import { Search } from '@tamagui/lucide-icons'
import { DBSearchPreview } from '../File/DBResultPreview'
import { useContentContext } from '@/contexts/ContentContext'

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
  const { openContent: openTabContent } = useContentContext()
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
    <ScrollView>
      <YStack height="100%" padding="$1">
        <XStack position="relative" marginRight="$1" borderRadius="$3" padding="$2">
          <XStack position="absolute" left={0} top={14} alignItems="center" paddingLeft="$3">
            <Search size={14} color="$gray13" />
          </XStack>
          <Input
            ref={searchInputRef}
            type="text"
            width="100%"
            height="$2"
            paddingLeft="$5"
            borderRadius="$2"
            backgroundColor="$gray1"
            color="$gray13"
            borderWidth={1}
            borderColor="$gray13"
            focusStyle={{
              borderColor: '$gray13',
              outlineWidth: 0,
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Semantic search..."
            fontSize="$1"
          />
        </XStack>
        {searchResults.length > 0 && (
          <YStack marginTop="$2" width="100%" px="$3">
            {searchResults.map((result, index) => (
              <DBSearchPreview key={index} dbResult={result} onSelect={openFileSelectSearch} />
            ))}
          </YStack>
        )}
      </YStack>
    </ScrollView>
  )
}

export default SearchComponent
