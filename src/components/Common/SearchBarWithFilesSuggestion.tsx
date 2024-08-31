import React, { useCallback, useRef } from 'react'
import { SuggestionsState } from '../Editor/BacklinkSuggestionsDisplay'

interface Props {
  vaultDirectory: string
  searchText: string
  setSearchText: (text: string) => void
  onSelectSuggestion: (suggestion: string) => void
  suggestionsState: SuggestionsState | null
  setSuggestionsState: (state: SuggestionsState | null) => void
}

const SearchBarWithFilesSuggestion: React.FC<Props> = ({
  searchText,
  setSearchText,
  onSelectSuggestion,
  setSuggestionsState,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const updateSuggestions = useCallback(() => {
    const inputCoords = inputRef.current?.getBoundingClientRect()
    if (!inputCoords) return

    if (searchText.length > 0) {
      const newSuggestionsState = {
        textWithinBrackets: searchText,
        position: {
          top: inputCoords.bottom,
          left: inputCoords.left,
        },
        onSelect: (suggestion) => onSelectSuggestion(`${suggestion}.md`),
      }
      setSuggestionsState(newSuggestionsState)
    } else {
      setSuggestionsState(null)
    }
  }, [searchText, setSuggestionsState, onSelectSuggestion])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      console.log('SearchBarWithFilesSuggestion - Input changed:', newValue)
      setSearchText(newValue)
      updateSuggestions()
    },
    [setSearchText, updateSuggestions],
  )

  return (
    <div className="mb-3 text-xl font-semibold text-white">
      <input
        ref={inputRef}
        type="text"
        className="mt-6 box-border block h-[40px] w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
        value={searchText}
        onChange={handleInputChange}
        placeholder="Search for files by name"
      />
      {!searchText && (
        <p className="text-xs text-red-500">Choose a file by searching or by right clicking a file in directory</p>
      )}
    </div>
  )
}

export default SearchBarWithFilesSuggestion
