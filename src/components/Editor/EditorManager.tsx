/* eslint-disable react/button-has-type */
import React, { useEffect, useState } from 'react'
import { EditorContent, BubbleMenu } from '@tiptap/react'
import { getHTMLFromFragment, Range } from '@tiptap/core'
import TurndownService from 'turndown'
import EditorContextMenu from './EditorContextMenu'
import SearchBar from './Search/SearchBar'
import { useFileContext } from '@/contexts/FileContext'
import DocumentStats from './DocumentStats'
import AiEditMenu from './AIEdit'

const EditorManager: React.FC = () => {
  const [showSearchBar, setShowSearchBar] = useState(false)
  const [contextMenuVisible, setContextMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [editorFlex, setEditorFlex] = useState(true)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const { editor } = useFileContext()
  const turndownService = new TurndownService()
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)

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
    if (!editor) return

    if (showAIPopup && selectedRange) {
      editor.chain().focus().setMark('highlight').run()
    }
  }, [showAIPopup, selectedRange, editor])

  useEffect(() => {
    if (!editor) return

    if (!showAIPopup) {
      editor?.commands.clearFormatting()
    }
  }, [showAIPopup, editor])

  useEffect(() => {
    if (showAIPopup) {
      setTimeout(() => {
        const textarea = document.querySelector('.ai-edit-menu textarea')
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.focus()
        }
      }, 50)
    }
  }, [showAIPopup])

  return (
    <div
      className="relative size-full cursor-text overflow-hidden bg-dark-gray-c-eleven py-4 text-slate-400 opacity-80"
      onClick={() => editor?.commands.focus()}
    >
      {editor && (
        <BubbleMenu
          className="flex gap-2 rounded-lg bg-transparent px-2"
          editor={editor}
          tippyOptions={{
            placement: 'auto',
            offset: [0, 10],
            interactive: true,
            interactiveBorder: 20,
            onHidden: () => {
              setShowAIPopup(false)
              setSelectedRange(null)
            },
            maxWidth: 'none',
          }}
        >
          <div
            className="w-[300px]"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onMouseUp={(e) => {
              e.preventDefault()
              e.stopPropagation()

              if (!showAIPopup) {
                setSelectedRange({
                  from: editor.state.selection.from,
                  to: editor.state.selection.to,
                })
              }
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {showAIPopup ? (
              <div className="ai-edit-menu">
                <AiEditMenu
                  selectedText={turndownService.turndown(
                    getHTMLFromFragment(
                      editor.state.doc.slice(
                        selectedRange?.from || editor.state.selection.from,
                        selectedRange?.to || editor.state.selection.to,
                      ).content,
                      editor.schema,
                    ),
                  )}
                  onEdit={(newText: string) => {
                    editor
                      .chain()
                      .focus()
                      .deleteRange({
                        from: selectedRange?.from || editor.state.selection.from,
                        to: selectedRange?.to || editor.state.selection.to,
                      })
                      .insertContent(newText)
                      .run()
                    setShowAIPopup(false)
                  }}
                />
              </div>
            ) : (
              <button onClick={() => setShowAIPopup(true)} className="rounded p-2 hover:bg-gray-700">
                AI Edit
              </button>
            )}
          </div>
        </BubbleMenu>
      )}
      <SearchBar editor={editor} showSearch={showSearchBar} setShowSearch={setShowSearchBar} />
      {contextMenuVisible && (
        <EditorContextMenu
          editor={editor}
          menuPosition={menuPosition}
          setMenuVisible={setContextMenuVisible}
          hideMenu={hideMenu}
        />
      )}

      <div className={`relative h-full ${editorFlex ? 'flex justify-center py-4 pl-4' : ''}`}>
        <div className="relative size-full overflow-y-auto">
          <EditorContent
            className={`relative size-full bg-dark-gray-c-eleven ${editorFlex ? 'max-w-xl' : ''}`}
            style={{
              wordBreak: 'break-word',
            }}
            onContextMenu={handleContextMenu}
            editor={editor}
          />
        </div>
      </div>
      <DocumentStats editor={editor} />
    </div>
  )
}

export default EditorManager
