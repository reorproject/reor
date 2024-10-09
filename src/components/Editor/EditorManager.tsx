import React, { useEffect, useState } from 'react'
import { EditorContent } from '@tiptap/react'
import InEditorBacklinkSuggestionsDisplay from './BacklinkSuggestionsDisplay'
import EditorContextMenu from './EditorContextMenu'
import SearchBar from './Search/SearchBar'
import { useFileContext } from '@/contexts/FileContext'
import { useWindowContentContext } from '@/contexts/WindowContentContext'

const EditorManager: React.FC = () => {
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [contextMenuVisible, setContextMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [editorFlex, setEditorFlex] = useState(true)
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const [writingAssistantTextPosition, setWritingAssistantTextPosition] = useState({ top: 0, left: 0 })

  const { editor, suggestionsState, flattenedFiles, currentlyOpenFilePath } = useFileContext()
  const [showDocumentStats, setShowDocumentStats] = useState(false)
  const { openContent } = useWindowContentContext()

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setMenuPosition({
      x: event.pageX,
      y: event.pageY,
    })
    setContextMenuVisible(true)
  }

  const hideMenu = () => {
    if (contextMenuVisible) setContextMenuVisible(false)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { target } = event
    if (target instanceof HTMLElement && target.getAttribute('data-backlink') === 'true') {
      event.preventDefault()
      const backlinkPath = target.textContent
      if (backlinkPath) openContent(backlinkPath)
    }
  }

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

  useEffect(() => {
    const initDocumentStats = async () => {
      const showStats = await window.electronStore.getDocumentStats()
      setShowDocumentStats(showStats)
    }

    initDocumentStats()

    const handleDocStatsChange = (event: Electron.IpcRendererEvent, value: boolean) => {
      setShowDocumentStats(value)
    }

    window.ipcRenderer.on('show-doc-stats-changed', handleDocStatsChange)
  }, [])

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      try {
        const { state } = editor
        const { from, to } = state.selection

        const $from = state.doc.resolve(from)
        const $to = state.doc.resolve(to)
        const start = $from.before()
        const end = $to.after()

        const currentLineText = state.doc.textBetween(start, end, '\n', ' ').trim()

        if (currentLineText === '') {
          const { node } = editor.view.domAtPos(from)
          const rect = (node as HTMLElement).getBoundingClientRect()
          const editorRect = editor.view.dom.getBoundingClientRect()
          setWritingAssistantTextPosition({ top: rect.top - editorRect.top, left: rect.left - editorRect.left })
          setShowPlaceholder(true)
        } else {
          setShowPlaceholder(false)
        }
      } catch (error) {
        setShowPlaceholder(false)
      }
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleUpdate)

    // eslint-disable-next-line consistent-return
    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleUpdate)
    }
  }, [editor])

  const handleInput = () => {
    if (editor) {
      const { state } = editor
      const { from, to } = state.selection

      const $from = state.doc.resolve(from)
      const $to = state.doc.resolve(to)
      const start = $from.before()
      const end = $to.after()

      const currentLineText = state.doc.textBetween(start, end, '\n', ' ').trim()
      setShowPlaceholder(currentLineText === '')
    }
  }
  useEffect(() => {
    if (editor) {
      editor.commands.focus()
    }
  }, [editor, currentlyOpenFilePath])

  return (
    <div
      className="relative size-full cursor-text overflow-hidden bg-dark-gray-c-eleven py-4 text-slate-400 opacity-80"
      onClick={() => editor?.commands.focus()}
    >
      <SearchBar editor={editor} showSearch={showSearchBar} setShowSearch={setShowSearchBar} />
      {contextMenuVisible && (
        <EditorContextMenu
          editor={editor}
          menuPosition={menuPosition}
          setMenuVisible={setContextMenuVisible}
          hideMenu={hideMenu}
        />
      )}

      <div
        className={`relative h-full ${editorFlex ? 'flex justify-center py-4 pl-4' : ''} ${showDocumentStats ? 'pb-3' : ''}`}
      >
        <div className="relative size-full overflow-y-auto">
          <EditorContent
            className={`relative size-full bg-dark-gray-c-eleven ${editorFlex ? 'max-w-xl' : ''}`}
            style={{
              wordBreak: 'break-word',
            }}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
            onInput={handleInput}
            editor={editor}
          />
          {showPlaceholder && (
            <div
              className="pointer-events-none absolute text-gray-500"
              style={{ top: writingAssistantTextPosition.top, left: writingAssistantTextPosition.left }}
            >
              Press &apos;space&apos; for AI writing assistant
            </div>
          )}
        </div>
      </div>
      {suggestionsState && (
        <InEditorBacklinkSuggestionsDisplay
          suggestionsState={suggestionsState}
          suggestions={flattenedFiles.map((file) => file.relativePath)}
        />
      )}
      {editor && showDocumentStats && (
        <div className="absolute bottom-2 right-2 flex gap-4 text-sm text-gray-500">
          <div>Characters: {editor.storage.characterCount.characters()}</div>
          <div>Words: {editor.storage.characterCount.words()}</div>
        </div>
      )}
    </div>
  )
}

export default EditorManager
