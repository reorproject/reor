import React, { useEffect, useState } from 'react'
import { YStack } from 'tamagui'
import InEditorBacklinkSuggestionsDisplay from './BacklinkSuggestionsDisplay'
import { useFileContext } from '@/contexts/FileContext'
import { BlockNoteView, FormattingToolbarPositioner, SlashMenuPositioner } from '@/lib/blocknote'

const EditorManager: React.FC = () => {
  // const [showSearchBar, setShowSearchBar] = useState(false)

  const [editorFlex, setEditorFlex] = useState(true)

  const { editor, suggestionsState, vaultFilesFlattened } = useFileContext()
  const [showDocumentStats, setShowDocumentStats] = useState(false)

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

  return (
    <YStack className="relative size-full cursor-text overflow-y-auto py-4 " onPress={() => editor?.focus()}>
      {/* <SearchBar editor={editor} showSearch={showSearchBar} setShowSearch={setShowSearchBar} /> */}

      <YStack
        className={`relative h-full  py-4 ${editorFlex ? 'flex justify-center px-24' : 'px-12'} ${showDocumentStats ? 'pb-3' : ''}`}
      >
        <YStack className="relative size-full">
          {editor && (
            <BlockNoteView editor={editor}>
              <FormattingToolbarPositioner editor={editor} />
              <SlashMenuPositioner editor={editor} />
            </BlockNoteView>
          )}
        </YStack>
      </YStack>
      {suggestionsState && (
        <InEditorBacklinkSuggestionsDisplay
          suggestionsState={suggestionsState}
          suggestions={vaultFilesFlattened.map((file) => file.relativePath)}
        />
      )}
      {/* {editor && showDocumentStats && (
        <div className="absolute bottom-2 right-2 flex gap-4 text-sm text-gray-500">
          <div>Characters: {editor.storage.characterCount.characters()}</div>
          <div>Words: {editor.storage.characterCount.words()}</div>
        </div>
      )} */}
    </YStack>
  )
}

export default EditorManager
