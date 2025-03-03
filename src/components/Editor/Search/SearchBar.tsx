import React, { useState, useEffect, useCallback } from 'react'
// import { Editor } from '@tiptap/react'
import { BlockNoteEditor } from '@/lib/blocknote'

interface SearchBarProps {
  editor: BlockNoteEditor | null
  showSearch: boolean
  setShowSearch: (show: boolean) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ editor, showSearch, setShowSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const toggleSearch = useCallback(() => {
    setShowSearch(!showSearch)
  }, [showSearch, setShowSearch])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    editor?.commands.setSearchTerm(value)
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
  }

  const handleNextSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      editor?.commands.nextSearchResult()
      goToSelection()
      ;(event.target as HTMLInputElement).focus()
    } else if (event.key === 'Escape') {
      toggleSearch()
      handleSearchChange('')
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        toggleSearch()
      }
      if (event.key === 'Escape' && showSearch) {
        setShowSearch(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch, toggleSearch, setShowSearch])

  if (!showSearch) return null

  return (
    <input
      type="text"
      value={searchTerm}
      onKeyDown={handleNextSearch}
      onChange={(event) => handleSearchChange(event.target.value)}
      onBlur={() => {
        setShowSearch(false)
        handleSearchChange('')
      }}
      placeholder="Search..."
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      className="absolute right-0 top-4 z-50 mr-14 mt-4 rounded-md border-none bg-transparent p-2 text-white"
    />
  )
}

export default SearchBar
