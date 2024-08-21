import React, { useEffect, useState } from 'react'

import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { toast } from 'react-toastify'
import removeMd from 'remove-markdown'

import '../../styles/global.css'
import { HighlightData } from '../Editor/HighlightExtension'

import errorToStringRendererProcess from '@/utils/error'
import SimilarEntriesComponent from './SemanticSidebar/SimilarEntriesComponent'
import HighlightButton from './SemanticSidebar/HighlightButton'

interface SimilarFilesSidebarComponentProps {
  filePath: string
  highlightData: HighlightData
  openFileAndOpenEditor: (filePath: string) => void

  saveCurrentlyOpenedFile: () => Promise<void>
}

const SimilarFilesSidebarComponent: React.FC<SimilarFilesSidebarComponentProps> = ({
  filePath,
  highlightData,
  openFileAndOpenEditor,
  saveCurrentlyOpenedFile,
}) => {
  const [similarEntries, setSimilarEntries] = useState<DBQueryResult[]>([])
  const [isLoadingSimilarEntries, setIsLoadingSimilarEntries] = useState(false)

  const getChunkForInitialSearchFromFile = async (filePathForChunk: string) => {
    // TODO: proper semantic chunking - current quick win is just to take top 500 characters
    const fileContent: string = await window.fileSystem.readFile(filePathForChunk)
    if (!fileContent) {
      return undefined
    }
    const sanitizedText = removeMd(fileContent.slice(0, 500))
    return sanitizedText
  }
  const performSearchOnChunk = async (
    sanitizedText: string,
    fileToBeExcluded: string,
    withReranking = false,
  ): Promise<DBQueryResult[]> => {
    try {
      const databaseFields = await window.database.getDatabaseFields()
      const filterString = `${databaseFields.NOTE_PATH} != '${fileToBeExcluded}'`

      setIsLoadingSimilarEntries(true)
      const searchResults: DBQueryResult[] = withReranking
        ? await window.database.searchWithReranking(sanitizedText, 20, filterString)
        : await window.database.search(sanitizedText, 20, filterString)

      setIsLoadingSimilarEntries(false)
      return searchResults
    } catch (error) {
      toast.error(errorToStringRendererProcess(error), {
        className: 'mt-5',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      })
      return []
    }
  }

  useEffect(() => {
    const handleNewFileOpen = async (path: string) => {
      const sanitizedText = await getChunkForInitialSearchFromFile(path)
      if (!sanitizedText) {
        return
      }
      const searchResults = await performSearchOnChunk(sanitizedText, path, false)

      if (searchResults.length > 0) {
        setSimilarEntries(searchResults)
      } else {
        setSimilarEntries([])
      }
    }
    if (filePath) {
      handleNewFileOpen(filePath)
    }
  }, [filePath])

  const updateSimilarEntries = async (isRefined?: boolean) => {
    const sanitizedText = await getChunkForInitialSearchFromFile(filePath)

    if (!sanitizedText) {
      toast.error(`Error: Could not get chunk for search ${filePath}`)
      return
    }

    const searchResults = await performSearchOnChunk(sanitizedText, filePath, isRefined)
    setSimilarEntries(searchResults)
  }

  return (
    <>
      <HighlightButton
        highlightData={highlightData}
        onClick={async () => {
          setSimilarEntries([])
          const databaseFields = await window.database.getDatabaseFields()
          const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`
          const searchResults: DBQueryResult[] = await window.database.search(highlightData.text, 20, filterString)
          setSimilarEntries(searchResults)
        }}
      />{' '}
      <SimilarEntriesComponent
        similarEntries={similarEntries}
        setSimilarEntries={setSimilarEntries}
        onFileSelect={(path: string) => {
          openFileAndOpenEditor(path)
          posthog.capture('open_file_from_related_notes')
        }}
        saveCurrentFile={async () => {
          await saveCurrentlyOpenedFile()
        }}
        updateSimilarEntries={updateSimilarEntries}
        isLoadingSimilarEntries={isLoadingSimilarEntries}
        titleText="Related notes"
      />
    </>
  )
}

export default SimilarFilesSidebarComponent
