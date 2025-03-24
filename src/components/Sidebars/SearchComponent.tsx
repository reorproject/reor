/* eslint-disable react/no-array-index-key */
import React, { useEffect, useRef, useCallback, useState } from 'react'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { debounce } from 'lodash'
import { Input, XStack, YStack, ScrollView, Stack, Slider, Text } from 'tamagui'
import { TextInput } from 'react-native'
import { Search, Filter } from '@tamagui/lucide-icons'
import { DBSearchPreview } from '../File/DBResultPreview'
import { useContentContext } from '@/contexts/ContentContext'
import { hybridSearch } from '@/lib/db'
import { ToggleButton, ToggleThumb } from '@/components/Editor/ui/src/toggle'
import { SearchProps as SearchParamsType } from 'electron/main/electron-store/types'

interface SearchComponentProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: DBQueryResult[]
  setSearchResults: (results: DBQueryResult[]) => void
}

export type SearchModeTypes = 'vector' | 'hybrid'

// Custom toggle component
const ToggleSwitch: React.FC<{
  isHybrid: boolean
  onChange: (searchMode: SearchModeTypes) => void
  className?: string
  label: string
}> = ({ isHybrid, onChange, className = '', label }) => (

  <ToggleButton
    hybrid={isHybrid}
    className={className}
    onPress={() => onChange(isHybrid ? 'vector' : 'hybrid')}
    aria-checked={isHybrid}
    role="switch"
    aria-label={label}
  >
    <Stack 
      position="absolute"
      width={1}
      height={1}
      padding={0}
      margin={-1}
      overflow="hidden"
      whiteSpace="nowrap"
      borderWidth={0}
    >
      {label}
    </Stack>
    <ToggleThumb hybrid={isHybrid} />
  </ToggleButton>
)

const SearchComponent: React.FC<SearchComponentProps> = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
}) => {
  const { openContent: openTabContent } = useContentContext()
  const searchInputRef = useRef<TextInput>(null)
  const [searchParams, setSearchParams] = useState<SearchParamsType>({
    searchMode: 'vector', 
    vectorWeight: 0.7,
  })
  const [showSearchOptions, setShowSearchOptions] = useState(false)

  useEffect(() => {
    const fetchSearchMode = async () => {
      const storedParams = await window.electronStore.getSearchParams()
      if (storedParams) setSearchParams(storedParams)
    }
    fetchSearchMode()
  }, [])

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

  const handleVectorWeightChange = (value: number[]) => {
    setSearchParams((prev) => ({
      ...prev,
      vectorWeight: value[0],
    }))
  }

  return (
    <ScrollView>
      <YStack height="100%" padding="$1">
        <XStack position="relative" marginRight="$1" borderRadius="$3" padding="$2">
          <XStack position="absolute" left={0} top={14} alignItems="center" paddingLeft="$3">
            <Search size={14} color="$gray13" />
          </XStack>
          <Input
            ref={searchInputRef}
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
            placeholder={searchParams.searchMode === 'hybrid' ? 'Search Hybrid...' : 'Search Vector...'}
            fontSize="$1"
          />
          <XStack
            position="absolute"
            right={16}
            top={14}
            alignItems="center"
            backgroundColor="transparent"
            hoverStyle={{ color: '$white' }}
            focusStyle={{ outlineWidth: 0 }}
            onPress={() => setShowSearchOptions(!showSearchOptions)}
            aria-label="Search options"
            cursor='pointer'
          >
            <Filter color="$gray10" size={14} />
          </XStack>
        </XStack>

        {showSearchOptions && (
          <YStack
            marginTop="$2"
            borderRadius="$2"
            borderWidth={1}
            borderColor="$gray6"
            padding="$3"
            shadowColor="$shadowColor"
            shadowRadius="$1"
            elevation="$1"
            backgroundColor="$gray2"
            className="animate-slide-in-down"
          >
            <XStack
              alignItems="center"
              justifyContent="space-between"
            >
              <Text
                fontSize="$1"
                fontWeight="500"
              >
                Hybrid Search
              </Text>
              <ToggleSwitch
                isHybrid={searchParams.searchMode === 'hybrid'}
                onChange={(mode) => setSearchParams((prev) => ({ ...prev, searchMode: mode }))}
                label="Hybrid Search"
              />
            </XStack>

            {searchParams.searchMode === 'hybrid' && (
              <YStack marginTop="$3">
                <XStack
                  marginBottom='$2'
                  alignItems='center'
                  justifyContent='space-between'
                >
                  <Text
                    fontSize="$1"
                    fontWeight="500"
                  >
                    Search Balance
                  </Text>
                  <Text 
                    fontSize="$1"
                    backgroundColor="$gray7"
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$1"
                  >
                    {Math.round(searchParams.vectorWeight * 100)}% Semantic -{' '}
                    {Math.round((1 - searchParams.vectorWeight) * 100)}% Keywords 
                  </Text>
                </XStack>
                <XStack position="relative">
                  <Slider
                    id="vector-weight-slider"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[searchParams.vectorWeight]}
                    onValueChange={handleVectorWeightChange}
                    height="$1"
                    width="100%"
                    backgroundColor="$gray9"
                    borderRadius="$10"
                    aria-label="Search balance slider"
                  >
                    <Slider.Track>
                      <Slider.TrackActive />
                    </Slider.Track>
                    <Slider.Thumb index={0} circular size={20} />
                  </Slider>
                </XStack>
                <XStack marginTop="$1.5" justifyContent="space-between">
                  <Text fontSize="$1" color="$gray10">Keywords</Text>
                  <Text fontSize="$1" color="$gray10">Balanced</Text>
                  <Text fontSize="$1" color="$gray10">Semantic</Text>
                </XStack>
              </YStack>
            )}            
          </YStack>
        )}


        { /* Search Results */ }
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
