import React, { useState, useCallback } from 'react'
import { ListChildComponentProps } from 'react-window'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import posthog from 'posthog-js'
import { isFileNodeDirectory } from '@shared/utils'
import { useFileContext } from '@/contexts/FileContext'
import { moveFile, removeFileExtension } from '@/lib/file'
import { useContentContext } from '@/contexts/ContentContext'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import NewDirectoryComponent from '@/components/File/NewDirectory'

const FileItemRows: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
  const { visibleItems } = data
  const fileOrDirectoryObject = visibleItems[index]
  const { file } = fileOrDirectoryObject

  const { handleDirectoryToggle, expandedDirectories, currentlyOpenFilePath, setNoteToBeRenamed, deleteFile } =
    useFileContext()
  const { openContent, createUntitledNote } = useContentContext()
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const [parentDirectoryPathForNewDirectory, setParentDirectoryPathForNewDirectory] = useState<string | undefined>(
    undefined,
  )
  const [isDragOver, setIsDragOver] = useState(false)

  const isDirectory = isFileNodeDirectory(file)
  const isSelected = file.path === currentlyOpenFilePath
  const indentation = fileOrDirectoryObject.indentMultiplyer ? 10 * fileOrDirectoryObject.indentMultiplyer : 0
  const isExpanded = expandedDirectories.get(file.path)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragOver(false), [])

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.stopPropagation()
      e.dataTransfer.setData('text/plain', file.path)
      e.dataTransfer.effectAllowed = 'move'
    },
    [file.path],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      const sourcePath = e.dataTransfer.getData('text/plain')
      const destinationPath = isDirectory ? file.path : await window.path.dirname(file.path)
      moveFile(sourcePath, destinationPath)
    },
    [file.path, isDirectory],
  )

  const toggle = useCallback(() => {
    if (isDirectory) {
      handleDirectoryToggle(file.path)
    } else {
      openContent(file.path)
      posthog.capture('open_file_from_sidebar')
    }
  }, [file.path, isDirectory, handleDirectoryToggle, openContent])

  const openNewDirectoryModal = useCallback(async () => {
    const dirPath = isDirectory ? file.path : await window.path.dirname(file.path)
    setParentDirectoryPathForNewDirectory(dirPath)
    setIsNewDirectoryModalOpen(true)
  }, [file.path, isDirectory])

  const handleDelete = useCallback(() => {
    const itemType = isDirectory ? 'directory' : 'file'
    const confirmMessage = `Are you sure you want to delete this ${itemType}?${
      isDirectory ? ' This will delete all contents of the directory.' : ''
    }`

    if (window.confirm(confirmMessage)) {
      deleteFile(file.path)
    }
  }, [deleteFile, file.path, isDirectory])

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 text-cyan-100 font-sans text-xs leading-relaxed rounded-md ${
    isSelected ? 'bg-neutral-700 text-white font-semibold' : 'text-gray-200'
  } ${isDragOver ? 'bg-neutral-500' : ''}`

  const renderContextMenuItems = () => (
    <>
      <ContextMenuItem
        onClick={async () => createUntitledNote(isDirectory ? file.path : await window.path.dirname(file.path))}
      >
        New file
      </ContextMenuItem>
      <ContextMenuItem onClick={openNewDirectoryModal}>New folder</ContextMenuItem>
      <ContextMenuItem onClick={() => setNoteToBeRenamed(file.path)}>Rename</ContextMenuItem>
      <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
    </>
  )

  return (
    <div style={{ ...style, paddingLeft: `${indentation}px` }}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <div onClick={toggle} className={itemClasses}>
              {isDirectory && (
                <span className="mr-2 mt-1 text-gray-200/20">
                  {isExpanded ? (
                    <FaChevronDown title="Collapse Directory" />
                  ) : (
                    <FaChevronRight title="Open Directory" />
                  )}
                </span>
              )}
              <span className="mt-0 flex-1 truncate">{isDirectory ? file.name : removeFileExtension(file.name)}</span>
            </div>
            <NewDirectoryComponent
              isOpen={isNewDirectoryModalOpen}
              onClose={() => setIsNewDirectoryModalOpen(false)}
              parentDirectoryPath={parentDirectoryPathForNewDirectory}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>{renderContextMenuItems()}</ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export default FileItemRows
