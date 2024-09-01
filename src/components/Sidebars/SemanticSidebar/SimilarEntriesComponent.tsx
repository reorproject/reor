import React from 'react'

import { CircularProgress } from '@mui/material'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import { FiRefreshCw } from 'react-icons/fi'
import { PiGraph } from 'react-icons/pi'

import '../../../styles/global.css'
import ResizableComponent from '@/components/Common/ResizableComponent'
import { DBResultPreview } from '@/components/File/DBResultPreview'
import { useFileContext } from '@/contexts/FileContext'

interface SimilarEntriesComponentProps {
  similarEntries: DBQueryResult[]
  setSimilarEntries?: (entries: DBQueryResult[]) => void
  onSelect: (path: string) => void
  updateSimilarEntries?: (isRefined?: boolean) => Promise<void>
  titleText: string
  isLoadingSimilarEntries: boolean
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  similarEntries,
  setSimilarEntries,
  onSelect,
  updateSimilarEntries,
  titleText,
  isLoadingSimilarEntries,
}) => {
  let content
  const { saveCurrentlyOpenedFile } = useFileContext()

  if (similarEntries.length > 0) {
    content = (
      <div className="size-full">
        {similarEntries
          .filter((dbResult) => dbResult)
          .map((dbResult) => (
            <div className="px-2 pb-2 pt-1" key={`${dbResult.notepath}-${dbResult.subnoteindex}`}>
              <DBResultPreview dbResult={dbResult} onSelect={onSelect} />
            </div>
          ))}
      </div>
    )
  } else if (!isLoadingSimilarEntries) {
    content = (
      <div className="flex size-full flex-col items-center justify-center">
        <p className="mx-auto flex items-center justify-center text-center text-lg text-gray-500">No items found</p>
      </div>
    )
  }

  return (
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
                <button
                  onClick={async () => {
                    setSimilarEntries([]) // simulate refresh
                    await saveCurrentlyOpenedFile()
                    updateSimilarEntries()
                  }}
                  className="m-0 flex cursor-pointer items-center border-0 bg-transparent p-0" // Reset button styles and add custom styles
                  type="button"
                >
                  {!isLoadingSimilarEntries && <FiRefreshCw className="text-gray-300" />}
                  {isLoadingSimilarEntries && <CircularProgress size={24} />}
                </button>
              )}
            </div>
          </div>
          <div className="grow overflow-y-auto overflow-x-hidden">{content}</div>
        </div>
      </ResizableComponent>
    </div>
  )
}

SimilarEntriesComponent.defaultProps = {
  setSimilarEntries: () => {},
  updateSimilarEntries: async () => {},
}

export default SimilarEntriesComponent
