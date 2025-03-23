import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Editor } from '@tiptap/core' // Adjust import based on your setup}
import { Button } from '@material-tailwind/react'
import { XStack, YStack, Separator } from 'tamagui'
import { ChevronDown, ChevronUp, X, Replace } from '@tamagui/lucide-icons'

interface SearchBarProps {
  editor: Editor | null
  showSearch: boolean
  setShowSearch: (show: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ editor, showSearch, setShowSearch, searchTerm, setSearchTerm }) => {
  const searchBarRef = useRef<HTMLDivElement>(null)

  const [replaceTerm, setReplaceTerm] = useState('')
  const [resultsExist, setResultsExist] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalResults, setTotalResults] = useState(0)

  const [showReplace, setShowReplace] = useState(false)

  const updateSearchResults = useCallback(() => {
    if (!editor) return
    const { results, resultIndex } = editor.storage.searchAndReplace

    const hasResults = results.length > 0
    setResultsExist(hasResults)
    setCurrentIndex(Math.min(resultIndex + 1, results.length))
    setTotalResults(results.length)
  }, [editor])

  const toggleReplace = () => {
    setShowReplace(!showReplace)
  }

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch)
    if (!showSearch) {
      editor?.commands.setSearchTerm(searchTerm)
      updateSearchResults()
    } else {
      editor?.commands.setSearchTerm('')
    }
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

  const goToSelection = () => {
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
  }

  const handleNextSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      editor?.commands.nextSearchResult()
      goToSelection()
    } else if (event.key === 'Escape') {
      toggleSearch()
    }
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        toggleSearch()
      }
      if (event.key === 'Escape' && showSearch) {
        toggleSearch()
      }
    },
    [showSearch, toggleSearch],
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
    color: resultsExist ? 'white' : 'gray',
    cursor: 'pointer',
  }

  if (!showSearch) return null
  return (
    <div
      ref={searchBarRef}
      className="animate-slide-in-down"
      style={{
        position: 'absolute',
        top: '10px',
        right: '16px',
        zIndex: 1000,
        borderRadius: '12px',
        width: '280px',
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
            onKeyDown={handleNextSearch}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search..."
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="w-full bg-transparent p-3 pr-16 text-white focus:outline-none"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white">
            {resultsExist ? `${currentIndex} / ${totalResults}` : '0 / 0'}
          </div>
        </div>

        <div className="mx-2 h-6 w-px bg-gray-500" />

        <XStack alignItems="center" gap={10}>
          <ChevronUp
            {...iconProps}
            onMouseDown={(event) => {
              event.preventDefault()
              editor?.commands.previousSearchResult()
              goToSelection()
            }}
          />
          <ChevronDown
            {...iconProps}
            onMouseDown={(event) => {
              event.preventDefault()
              editor?.commands.nextSearchResult()
              goToSelection()
            }}
          />
          {(showReplace || resultsExist) && <Replace color="white" cursor="pointer" onClick={toggleReplace} />}
          <X {...iconProps} onClick={toggleSearch} />
        </XStack>
      </XStack>
      {showReplace && (
        <YStack className="animate-slide-in-down">
          <Separator />
          <YStack alignItems="center" gap={3} className="rounded-b-md bg-gray-800 p-2 shadow-lg">
            <input
              value={replaceTerm}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  editor?.commands.replace()
                  updateSearchResults()
                }
              }}
              onChange={(event) => handleReplaceChange(event.target.value)}
              placeholder="Replace..."
              className="w-full bg-transparent p-3 pr-16 text-white focus:outline-none"
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
