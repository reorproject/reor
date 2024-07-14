import React, { useEffect, useState } from 'react'

import { CircularProgress } from '@mui/material'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { FaArrowRight } from 'react-icons/fa'
import { FiRefreshCw } from 'react-icons/fi'
import { PiGraph } from 'react-icons/pi'
import { toast } from 'react-toastify'
import removeMd from 'remove-markdown'

import '../../styles/global.css'
import ResizableComponent from '../Common/ResizableComponent'
import { HighlightData } from '../Editor/HighlightExtension'
import { DBResultPreview } from '../File/DBResultPreview'

import { errorToStringRendererProcess } from '@/utils/error'

interface SimilarFilesSidebarComponent {
  filePath: string
  highlightData: HighlightData
  openFileByPath: (filePath: string) => void

  saveCurrentlyOpenedFile: () => Promise<void>
}

const SimilarFilesSidebarComponent: React.FC<SimilarFilesSidebarComponent> = ({
  filePath,
  highlightData,
  openFileByPath,
  saveCurrentlyOpenedFile,
}) => {
  const [similarEntries, setSimilarEntries] = useState<DBQueryResult[]>([])
  const [isLoadingSimilarEntries, setIsLoadingSimilarEntries] = useState(false)
  const [isRefined, setIsRefined] = useState(false)

  useEffect(() => {
    if (filePath) {
      handleNewFileOpen(filePath)
    }
  }, [filePath])

  const handleNewFileOpen = async (path: string) => {
    setIsRefined(false)
    try {
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
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getChunkForInitialSearchFromFile = async (filePath: string) => {
    // TODO: proper semantic chunking - current quick win is just to take top 500 characters
    const fileContent: string = await window.fileSystem.readFile(filePath)
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
      console.error('Error:', error)
      toast.error(errorToStringRendererProcess(error), {
        className: 'mt-5',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      })
      return []
    }
  }

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
        // filePath={filePath}
        isRefined={isRefined}
        setIsRefined={setIsRefined}
        similarEntries={similarEntries}
        setSimilarEntries={setSimilarEntries}
        onFileSelect={(path: string) => {
          openFileByPath(path)
          posthog.capture('open_file_from_related_notes')
        }}
        saveCurrentFile={async () => {
          await saveCurrentlyOpenedFile()
        }}
        updateSimilarEntries={updateSimilarEntries}
        isLoadingSimilarEntries={isLoadingSimilarEntries}
        titleText="Related notes"
      />
      {/* </ResizableComponent> */}
    </>
  )
}

export default SimilarFilesSidebarComponent

interface SimilarEntriesComponentProps {
  // filePath: string;
  similarEntries: DBQueryResult[]
  setSimilarEntries?: (entries: DBQueryResult[]) => void
  isRefined: boolean
  setIsRefined: (isRefined: boolean) => void
  onFileSelect: (path: string) => void
  saveCurrentFile: () => Promise<void>
  updateSimilarEntries?: (isRefined?: boolean) => Promise<void>
  titleText: string
  isLoadingSimilarEntries: boolean
}

export const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  similarEntries,
  setSimilarEntries,
  onFileSelect,
  saveCurrentFile,
  updateSimilarEntries,
  titleText,
  isLoadingSimilarEntries,
}) => (
  <div className="h-full">
    <ResizableComponent resizeSide="left" initialWidth={300}>
      <div className="flex h-full flex-col border-y-0 border-l-[0.1px] border-r-0 border-solid border-neutral-700">
        <div className="flex items-center bg-neutral-800 p-0">
          <div className="flex-1" />
          <div className="flex items-center justify-center px-4">
            <PiGraph className="mt-1 text-gray-300" />
            <p className="mb-0 mt-1 pl-1 text-sm text-gray-300">{titleText}</p>
          </div>
          <div className="flex flex-1 cursor-pointer justify-end pr-3 pt-1">
            {updateSimilarEntries && setSimilarEntries && (
              <div
                onClick={async () => {
                  setSimilarEntries([]) // simulate refresh
                  await saveCurrentFile()
                  updateSimilarEntries()
                }}
              >
                {!isLoadingSimilarEntries && <FiRefreshCw className="text-gray-300" title="Refresh Related Notes" />}
                {isLoadingSimilarEntries && <CircularProgress size={24} />}
              </div>
            )}
          </div>
        </div>
        <div className="grow overflow-y-auto overflow-x-hidden">
          {similarEntries.length > 0 ? (
            <div className="size-full">
              {similarEntries
                .filter((dbResult) => dbResult)
                .map((dbResult, index) => (
                  <div className="px-2 pb-2 pt-1" key={index}>
                    <DBResultPreview
                      key={index}
                      dbResult={dbResult}
                      onSelect={(path: string) => {
                        onFileSelect(path)
                      }}
                    />
                  </div>
                ))}
            </div>
          ) : !isLoadingSimilarEntries ? (
            <div className="flex size-full flex-col items-center justify-center">
              <p className="mx-auto flex items-center justify-center text-center text-lg text-gray-500">
                No items found
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </ResizableComponent>
  </div>
)
interface HighlightButtonProps {
  highlightData: HighlightData
  onClick: () => void
}
const HighlightButton: React.FC<HighlightButtonProps> = ({ highlightData, onClick }) => {
  const [showArrow, setShowArrow] = useState<boolean>(false)

  useEffect(() => {
    // Reset to PiGraph icon when the position becomes undefined (unmounted)
    if (!highlightData.position) {
      setShowArrow(false)
    }
  }, [highlightData.position])

  if (!highlightData.position) {
    return null
  }

  const { top, left } = highlightData.position
  // top -= 55;
  // left -= 190;

  const handleClick = () => {
    onClick() // This calls the provided onClick handler
    setShowArrow(true) // Show the arrow icon
  }

  return (
    <button
      onClick={handleClick}
      style={{ top: `${top}px`, left: `${left}px` }}
      className="absolute flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-gray-200 text-white shadow-md hover:bg-gray-300"
      aria-label="Highlight button"
    >
      {showArrow ? <FaArrowRight className="text-gray-800" /> : <PiGraph className="text-gray-800" />}
    </button>
  )
}
