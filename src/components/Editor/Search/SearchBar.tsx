import React, { useState, useEffect, useCallback } from 'react'
import { Editor } from '@tiptap/core' // Adjust import based on your setup}
import { XStack } from 'tamagui'
import { ChevronDown, ChevronUp, X } from '@tamagui/lucide-icons'

interface SearchBarProps {
  editor: Editor | null
  showSearch: boolean
  setShowSearch: (show: boolean) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ editor, showSearch, setShowSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [resultsExist, setResultsExist] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalResults, setTotalResults] = useState(0)

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch)
  }, [showSearch, setShowSearch])

  const updateSearchResults = useCallback(() => {
    if (!editor) return
    const { results, resultIndex } = editor.storage.searchAndReplace

    const hasResults = results.length > 0
    setResultsExist(hasResults)
    setCurrentIndex(resultIndex + 1)
    setTotalResults(results.length)
  }, [editor])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    editor?.commands.setSearchTerm(value)
    updateSearchResults() // Update only when term changes
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
      handleSearchChange('')
    }
  }

  useEffect(() => {
    if (editor) {
      updateSearchResults()
    }
  }, [editor, searchTerm, updateSearchResults])

  if (!showSearch) return null

  const iconProps = {
    size: 18,
    color: resultsExist ? 'white' : 'gray',
    cursor: 'pointer',
  }

  return (
    <div className="fixed right-4 top-10 z-50 flex items-center space-x-2 rounded-md p-2">
      <XStack alignItems="center" width="100%" className="rounded-md bg-gray-800 p-2 shadow-lg">
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
            onClick={() => {
              editor?.commands.previousSearchResult()
              goToSelection()
            }}
          />
          <ChevronDown
            {...iconProps}
            onClick={() => {
              editor?.commands.nextSearchResult()
              goToSelection()
            }}
          />
          <X {...iconProps} />
        </XStack>
      </XStack>
    </div>
  )
}

export default SearchBar
