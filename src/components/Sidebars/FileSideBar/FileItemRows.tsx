import React, { useState, useCallback } from 'react'
import { ListChildComponentProps } from 'react-window'
import posthog from 'posthog-js'
import { isFileNodeDirectory } from '@shared/utils'
import { YStack, XStack } from 'tamagui'
import { ChevronRight, ChevronDown } from '@tamagui/lucide-icons'
import { useFileContext } from '@/contexts/FileContext'
import { removeFileExtension } from '@/lib/file'
import { useContentContext } from '@/contexts/ContentContext'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import NewDirectoryComponent from '@/components/File/NewDirectory'

const FileItemRows: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
  const { file, indentation } = data.filesAndIndentations[index]

  const {
    handleDirectoryToggle,
    expandedDirectories,
    currentlyOpenFilePath,
    setNoteToBeRenamed,
    deleteFile,
    selectedDirectory,
    setSelectedDirectory,
    renameFile,
  } = useFileContext()
  const { openContent, createUntitledNote } = useContentContext()
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const [parentDirectoryPathForNewDirectory, setParentDirectoryPathForNewDirectory] = useState<string | undefined>()
  const [isDragOver, setIsDragOver] = useState(false)

  const isDirectory = isFileNodeDirectory(file)
  const isSelected = isDirectory ? file.path === selectedDirectory : file.path === currentlyOpenFilePath

  const indentationPadding = indentation ? 10 * indentation : 0
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
      const destinationDirectory = isDirectory ? file.path : await window.path.dirname(file.path)
      const destinationPath = await window.path.join(destinationDirectory, await window.path.basename(sourcePath))
      renameFile(sourcePath, destinationPath)
    },
    [file.path, isDirectory, renameFile],
  )

  const clickOnFileOrDirectory = useCallback(
    (e: React.MouseEvent) => {
      if (isDirectory) {
        handleDirectoryToggle(file.path)
        setSelectedDirectory(file.path)
      } else {
        openContent(file.path)
        posthog.capture('open_file_from_sidebar')
      }
      e.stopPropagation()
    },
    [file.path, isDirectory, handleDirectoryToggle, openContent, setSelectedDirectory],
  )

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

    // eslint-disable-next-line no-alert
    if (window.confirm(confirmMessage)) {
      deleteFile(file.path)
    }
  }, [deleteFile, file.path, isDirectory])

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 h-full mt-0 mb-0 font-sans text-xs leading-relaxed rounded-md ${
    isSelected ? 'font-semibold' : ''
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
    <div style={{ ...style, paddingLeft: `${indentationPadding}px` }}>
      <ContextMenu>
        <ContextMenuTrigger>
          <YStack
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <XStack
              hoverStyle={{
                backgroundColor: '$gray7',
                backgroundFocus: '$gray8',
              }}
              backgroundColor={isSelected && !isDirectory ? '$gray7' : ''}
              onClick={clickOnFileOrDirectory}
              className={itemClasses}
            >
              {isDirectory && (
                <span className="mr-2 mt-1">
                  {isExpanded ? (
                    // <FaChevronDown title="Collapse Directory" />
                    <ChevronDown title="Collapse Directory" size={14} color="$gray10" />
                  ) : (
                    // <FaChevronRight title="Open Directory" />
                    <ChevronRight title="Open Directory" size={14} color="$gray10" />
                  )}
                </span>
              )}
              <span className="mt-0 flex-1 truncate">{isDirectory ? file.name : removeFileExtension(file.name)}</span>
            </XStack>
            <NewDirectoryComponent
              isOpen={isNewDirectoryModalOpen}
              onClose={() => setIsNewDirectoryModalOpen(false)}
              parentDirectoryPath={parentDirectoryPathForNewDirectory}
            />
          </YStack>
        </ContextMenuTrigger>
        <ContextMenuContent>{renderContextMenuItems()}</ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export default FileItemRows
