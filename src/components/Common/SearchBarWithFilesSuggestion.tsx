import React, { useEffect, useRef, useCallback } from 'react'

import { SuggestionsDisplayProps } from '../Editor/BacklinkSuggestionsDisplay'
import useFileInfoTree from '../Sidebars/FileSideBar/hooks/use-file-info-tree'

interface SearchBarWithFilesSuggestionProps {
  vaultDirectory: string
  searchText: string
  setSearchText: (text: string) => void
  onSelectSuggestion: (suggestion: string) => void
  setSuggestionsState: (state: SuggestionsDisplayProps | null) => void
}

const SearchBarWithFilesSuggestion: React.FC<SearchBarWithFilesSuggestionProps> = ({
  vaultDirectory,
  searchText,
  setSearchText,
  onSelectSuggestion,
  setSuggestionsState,
}) => {
  const { flattenedFiles } = useFileInfoTree(vaultDirectory)
  const inputRef = useRef<HTMLInputElement>(null)

  const updateSuggestions = useCallback(
    (text: string) => {
      const filteredSuggestions = flattenedFiles
        .filter((file) => file.path.toLowerCase().includes(text.toLowerCase()))
        .map((file) => file.path)

      setSuggestionsState({
        suggestionsState: {
          textWithinBrackets: text,
          position: { top: 0, left: 0 },
          onSelect: (suggestion: string) => onSelectSuggestion(`${suggestion}.md`),
        },
        suggestions: filteredSuggestions,
      })
    },
    [flattenedFiles, setSuggestionsState, onSelectSuggestion],
  )

  useEffect(() => {
    updateSuggestions(searchText)
  }, [searchText, updateSuggestions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setSearchText(newText)
    updateSuggestions(newText)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        className="mt-6 box-border block h-[40px] w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
        value={searchText}
        onChange={handleInputChange}
        placeholder="Search for files by name"
      />
    </div>
  )
}

export default SearchBarWithFilesSuggestion
