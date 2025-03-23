import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Editor } from '@tiptap/core' // Adjust import based on your setup}
import { Button } from '@material-tailwind/react'
import { XStack, YStack, Separator } from 'tamagui'
import { ChevronDown, ChevronUp, X, Replace } from '@tamagui/lucide-icons'

interface SearchBarProps {
  editor: Editor | null
}

interface SearchLocationProps {
  currentIndex: number
  totalResults: number
  resultsExist: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({ editor }) => {
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const searchBarRef = useRef<HTMLDivElement>(null)

  const [replaceTerm, setReplaceTerm] = useState('')

  const [searchLocation, setSearchLocation] = useState<SearchLocationProps>({
    currentIndex: 0,
    totalResults: 0,
    resultsExist: false,
  })
  const [showReplace, setShowReplace] = useState(false)

  const updateSearchResults = useCallback(() => {
    if (!editor) return
    const { results, resultIndex } = editor.storage.searchAndReplace

    const hasResults = results.length > 0
    setSearchLocation({
      currentIndex: Math.min(resultIndex + 1, results.length),
      totalResults: results.length,
      resultsExist: hasResults,
    })
  }, [editor])

  const toggleReplace = () => {
    setShowReplace(!showReplace)
  }

  const toggleSearch = useCallback(() => {
    if (!showSearch) {
      // Toggling from off to on, so restate the original value
      editor?.commands.setSearchTerm(searchTerm)
      updateSearchResults()
    } else {
      // Toggling on to off, so clear the search term (if we do not then the highlights remain)
      editor?.commands.setSearchTerm('')
    }
    setShowSearch(!showSearch)
  }, [showSearch, setShowSearch, editor?.commands, searchTerm, updateSearchResults])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    editor?.commands.setSearchTerm(value)
    updateSearchResults()
  }

  const handleReplaceChange = (value: string) => {
    setReplaceTerm(value)
    editor?.commands.setReplaceTerm(value)
  }

  const goToSelection = useCallback(() => {
    if (!editor) return
    const { results, resultIndex } = editor.storage.searchAndReplace

    const position = results[resultIndex]
    if (!position) return
    editor.commands.setTextSelection(position)
    const { node } = editor.view.domAtPos(editor.state.selection.anchor)

    if (node instanceof Element) {
      node.scrollIntoView?.(false)
    }

    updateSearchResults()
  }, [editor, updateSearchResults])


  const handleSearch = useCallback((event: any, genericSearchResult: (() => boolean) | undefined) => {
    event.preventDefault()
    if (genericSearchResult) genericSearchResult()
    goToSelection()
  }, [goToSelection])

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === 'Enter') {
        handleSearch(event, editor?.commands.nextSearchResult)
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'f' && !showSearch) {
        toggleSearch()
      } else if (event.key === 'Escape' && showSearch) {
        toggleSearch()
      }
    },
    [showSearch, handleSearch, editor?.commands.nextSearchResult, toggleSearch],
  )

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        toggleSearch()
      }
    },
    [toggleSearch],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside, handleKeyDown])

  const iconProps = {
    size: 18,
    color: searchLocation.resultsExist ? 'white' : 'gray',
    cursor: 'pointer',
  }

  if (!showSearch) return null
  return (
    <div
      ref={searchBarRef}
      className="fixed right-4 top-10 w-[280px] animate-slide-in-down rounded-[12px]"
      style={{
        zIndex: 1000,
        outline: 'rgba(35, 131, 226, 0.14) solid 3px',
      }}
    >
      <XStack
        alignItems="center"
        width="100%"
        className={`rounded-t-md ${!showReplace ? 'rounded-b-md' : ''} bg-gray-800 p-2 shadow-lg`}
      >
        <div className="relative flex-1">
          <input
            value={searchTerm}
            onKeyDown={handleKeyDown}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search..."
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="w-full bg-transparent p-1 pr-16 text-white focus:outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white">
            {searchLocation.resultsExist ? `${searchLocation.currentIndex} / ${searchLocation.totalResults}` : '0 / 0'}
          </div>
        </div>

        <div className="mx-2 h-6 w-px bg-gray-500" />

        <XStack alignItems="center" gap={10}>
          <ChevronUp
            {...iconProps}
            onMouseDown={(event) => handleSearch(event, editor?.commands.previousSearchResult)}
          />
          <ChevronDown {...iconProps} onMouseDown={(event) => handleSearch(event, editor?.commands.nextSearchResult)} />
          {(showReplace || searchLocation.resultsExist) && (
            <Replace size={16} color="white" cursor="pointer" onClick={toggleReplace} />
          )}
          <X {...iconProps} onClick={toggleSearch} />
        </XStack>
      </XStack>
      {showReplace && (
        <YStack className="animate-slide-in-down">
          <Separator />
          <YStack alignItems="center" gap={3} className="rounded-b-md bg-gray-800 p-2 shadow-lg">
            <input
              value={replaceTerm}
              onKeyDown={handleKeyDown}
              onChange={(event) => handleReplaceChange(event.target.value)}
              placeholder="Replace..."
              className="w-full bg-transparent p-1 pr-16 text-white focus:outline-none"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <div className="flex w-full justify-end gap-1">
              <Button
                className="h-10 w-[90px] cursor-pointer border-none bg-transparent px-2 py-0 text-center hover:bg-gray-700"
                onClick={() => {
                  if (!editor) return
                  editor.commands.replaceAll()
                  updateSearchResults()
                }}
              >
                Replace All
              </Button>

              <Button
                className="h-10 w-[100px] cursor-pointer border-none bg-blue-600 px-2 py-0 text-center hover:bg-blue-700"
                onClick={() => {
                  if (!editor) return
                  editor.commands.replace()
                  updateSearchResults()
                }}
              >
                Replace Next
              </Button>
            </div>
          </YStack>
        </YStack>
      )}
    </div>
  )
}

export default SearchBar
