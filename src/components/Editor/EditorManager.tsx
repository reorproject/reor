import React, { useCallback, useEffect, useState } from 'react'

import { Editor, EditorContent } from '@tiptap/react'

import InEditorBacklinkSuggestionsDisplay, { SuggestionsState } from './BacklinkSuggestionsDisplay'
import EditorContextMenu from './EditorContextMenu'

interface EditorManagerProps {
  editor: Editor | null
  suggestionsState: SuggestionsState | null | undefined
  flattenedFiles: { relativePath: string }[]
  showSimilarFiles: boolean
}

const EditorManager: React.FC<EditorManagerProps> = ({
  editor,
  suggestionsState,
  flattenedFiles,
  showSimilarFiles,
}) => {
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [editorFlex, setEditorFlex] = useState(true)

  const toggleSearch = useCallback(() => {
    setShowSearch((prevShowSearch) => !prevShowSearch)
  }, [])

  useEffect(() => {}, [showSimilarFiles])

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

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setMenuPosition({
      x: event.pageX,
      y: event.pageY,
    })
    setMenuVisible(true)
  }

  const hideMenu = () => {
    if (menuVisible) setMenuVisible(false)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        toggleSearch()
      }
      if (event.key === 'Escape') {
        if (showSearch) setShowSearch(false)
        if (menuVisible) setMenuVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch, menuVisible, toggleSearch])

  // If "Content Flex Center" is set to true in Settings, then it centers the content of the Editor
  useEffect(() => {
    const initEditorContentCenter = async () => {
      const isCenter = await window.electronStore.getEditorFlexCenter()
      setEditorFlex(isCenter)
    }

    const handleEditorChange = (event: any, editorFlexCenter: boolean) => {
      setEditorFlex(editorFlexCenter)
    }

    initEditorContentCenter()
    window.ipcRenderer.on('editor-flex-center-changed', handleEditorChange)
  }, [])

  return (
    <div
      className="relative size-full cursor-text overflow-y-auto py-4 text-slate-400 opacity-80 bg-dark-gray-c-eleven"
      onClick={() => editor?.commands.focus()}
    >
      {showSearch && (
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
      )}
      {menuVisible && <EditorContextMenu editor={editor} menuPosition={menuPosition} setMenuVisible={setMenuVisible} />}
      <div className={`relative h-full overflow-y-auto ${editorFlex ? 'flex justify-center py-4 pl-4' : ''}`}>
        <EditorContent
          className={`relative size-full bg-dark-gray-c-eleven ${editorFlex ? 'max-w-xl' : ''}`}
          style={{
            wordBreak: 'break-word',
          }}
          onContextMenu={handleContextMenu}
          onClick={hideMenu}
          editor={editor}
        />
      </div>
      {suggestionsState && (
        <InEditorBacklinkSuggestionsDisplay
          suggestionsState={suggestionsState}
          suggestions={flattenedFiles.map((file) => file.relativePath)}
        />
      )}
    </div>
  )
}

export default EditorManager
