import React, { useState } from 'react'
import { ListChildComponentProps } from 'react-window'
import { FileInfoNode } from 'electron/main/filesystem/types'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import posthog from 'posthog-js'
import { isFileNodeDirectory } from '@shared/utils'
import { useFileContext } from '@/contexts/FileContext'
import { moveFile } from '../../../lib/file'
import { removeFileExtension } from '@/lib/file'
import { useContentContext } from '@/contexts/ContentContext'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import NewDirectoryComponent from '@/components/File/NewDirectory'
// import { useModalOpeners } from '@/contexts/ModalContext'

const FileItemRows: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
  const { visibleItems } = data
  const fileOrDirectoryObject = visibleItems[index]

  const { handleDirectoryToggle, expandedDirectories, currentlyOpenFilePath } = useFileContext()
  const { openContent, createUntitledNote } = useContentContext()
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const [parentDirectoryPathForNewDirectory, setParentDirectoryPathForNewDirectory] = useState<string | undefined>(
    undefined,
  )
  // const { setIsNewDirectoryModalOpen } = useModalOpeners()

  const [isDragOver, setIsDragOver] = useState(false)

  const isDirectory = isFileNodeDirectory(fileOrDirectoryObject.file)
  const isSelected = fileOrDirectoryObject.file.path === currentlyOpenFilePath
  const indentation = fileOrDirectoryObject.indentMultiplyer ? 10 * fileOrDirectoryObject.indentMultiplyer : 0
  const isExpanded =
    expandedDirectories.has(fileOrDirectoryObject.file.path) && expandedDirectories.get(fileOrDirectoryObject.file.path)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDragFile = (e: React.DragEvent, file: FileInfoNode) => {
    e.dataTransfer.setData('text/plain', file.path)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const sourcePath = e.dataTransfer.getData('text/plain')
    let destinationPath = fileOrDirectoryObject.file.path
    if (!isFileNodeDirectory(fileOrDirectoryObject.file)) {
      const pathSegments = fileOrDirectoryObject.file.path.split('/')
      pathSegments.pop()
      destinationPath = pathSegments.join('/')
    }
    moveFile(sourcePath, destinationPath)
    // Refresh file list here or in moveFile function
  }

  const toggle = () => {
    if (isDirectory) {
      handleDirectoryToggle(fileOrDirectoryObject.file.path)
    } else {
      openContent(fileOrDirectoryObject.file.path)
      posthog.capture('open_file_from_sidebar')
    }
  }

  const localHandleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    handleDragFile(e, fileOrDirectoryObject.file)
  }

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 text-cyan-100 font-sans text-xs leading-relaxed rounded-md ${
    isSelected ? 'bg-neutral-700 text-white font-semibold' : 'text-gray-200'
  } ${isDragOver ? 'bg-neutral-500' : ''}`

  const openNewDirectoryModal = async () => {
    if (isFileNodeDirectory(fileOrDirectoryObject.file)) {
      setParentDirectoryPathForNewDirectory(fileOrDirectoryObject.file.path)
    } else {
      const dirName = await window.path.dirname(fileOrDirectoryObject.file.path)
      setParentDirectoryPathForNewDirectory(dirName)
    }
    setIsNewDirectoryModalOpen(true)
  }

  return (
    <div style={{ ...style, paddingLeft: `${indentation}px` }}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            draggable
            onDragStart={localHandleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <div onClick={toggle} className={itemClasses}>
              {isDirectory && (
                <span className="mr-2 mt-1 text-gray-200/20 ">
                  {isExpanded ? (
                    <FaChevronDown title="Collapse Directory" />
                  ) : (
                    <FaChevronRight title="Open Directory" />
                  )}
                </span>
              )}
              <span className="mt-0 flex-1 truncate">
                {isDirectory ? fileOrDirectoryObject.file.name : removeFileExtension(fileOrDirectoryObject.file.name)}
              </span>
            </div>
            <NewDirectoryComponent
              isOpen={isNewDirectoryModalOpen}
              onClose={() => setIsNewDirectoryModalOpen(false)}
              parentDirectoryPath={parentDirectoryPathForNewDirectory}
            />{' '}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isDirectory ? (
            <>
              <ContextMenuItem onClick={() => createUntitledNote(fileOrDirectoryObject.file.path)}>
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={openNewDirectoryModal}>New Folder</ContextMenuItem>
              <ContextMenuItem>Rename</ContextMenuItem>
              <ContextMenuItem>Delete</ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem
                onClick={async () => {
                  const directory = await window.path.dirname(fileOrDirectoryObject.file.path)
                  createUntitledNote(directory)
                }}
              >
                New File
              </ContextMenuItem>
              <ContextMenuItem onClick={openNewDirectoryModal}>New Folder</ContextMenuItem>
              <ContextMenuItem>Open</ContextMenuItem>
              <ContextMenuItem>Rename</ContextMenuItem>
              <ContextMenuItem>Delete</ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export default FileItemRows
