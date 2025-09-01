import React, { useState, useCallback } from 'react'
import { ListChildComponentProps } from 'react-window'
import posthog from 'posthog-js'
import { isFileNodeDirectory } from '@shared/utils'
import { XStack, Text } from 'tamagui'
import { format } from 'date-fns'
import { ChevronRight, ChevronDown } from '@tamagui/lucide-icons'
import { toast } from 'react-toastify'
import { useFileContext } from '@/contexts/FileContext'
import { getFilesInDirectory, removeFileExtension } from '@/lib/file'
import { useContentContext } from '@/contexts/ContentContext'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import NewDirectoryComponent from '@/components/File/NewDirectory'

const FileItemRows: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
  const { file, indentation } = data.filesAndIndentations[index]
  const showDates: boolean = data.showDates ?? true

  const {
    handleDirectoryToggle,
    expandedDirectories,
    currentlyOpenFilePath,
    setNoteToBeRenamed,
    deleteFile,
    selectedDirectory,
    setSelectedDirectory,
    renameFile,
    selectedFilePaths,
    selectSingleFile,
    toggleSelectFile,
    selectRangeTo,
    vaultFilesFlattened,
  } = useFileContext()
  const { openContent, createUntitledNote } = useContentContext()
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const [parentDirectoryPathForNewDirectory, setParentDirectoryPathForNewDirectory] = useState<string | undefined>()
  const [isDragOver, setIsDragOver] = useState(false)

  const isDirectory = isFileNodeDirectory(file)
  const formattedDate =
    showDates && !isDirectory && file.dateModified instanceof Date ? format(file.dateModified, 'MM-dd-yy') : ''
  let isSelected = false
  if (isDirectory) {
    isSelected = selectedFilePaths.includes(file.path) || file.path === selectedDirectory
  } else if (selectedFilePaths.length > 0) {
    isSelected = selectedFilePaths.includes(file.path)
  } else {
    isSelected = file.path === currentlyOpenFilePath
  }

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
    (event: any) => {
      const e = event.nativeEvent || event
      if (isDirectory) {
        if (e.metaKey || e.ctrlKey) {
          toggleSelectFile(file.path)
        } else {
          handleDirectoryToggle(file.path)
          setSelectedDirectory(file.path)
        }
        e.stopPropagation()
        return
      }

      if (e.shiftKey) {
        selectRangeTo(file.path)
      } else if (e.metaKey || e.ctrlKey) {
        toggleSelectFile(file.path)
      } else {
        selectSingleFile(file.path)
        openContent(file.path)
        posthog.capture('open_file_from_sidebar')
      }

      e.stopPropagation()
    },
    [
      file.path,
      isDirectory,
      handleDirectoryToggle,
      openContent,
      setSelectedDirectory,
      selectRangeTo,
      toggleSelectFile,
      selectSingleFile,
    ],
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
      <ContextMenuItem
        onClick={async () => {
          try {
            // Determine current selection scope
            const baseSelection =
              selectedFilePaths.length > 1 && selectedFilePaths.includes(file.path) ? selectedFilePaths : [file.path]

            // Partition into directories and files
            const dirPaths: string[] = []
            const filePaths: string[] = []
            for (const p of baseSelection) {
              // eslint-disable-next-line no-await-in-loop
              const isDir = await window.fileSystem.isDirectory(p)
              if (isDir) dirPaths.push(p)
              else filePaths.push(p)
            }

            // Build folder sections with H1 headers
            const seenFiles = new Set<string>()
            const parts: string[] = []
            for (const dir of dirPaths) {
              // eslint-disable-next-line no-await-in-loop
              const folderName = await window.path.basename(dir)
              // eslint-disable-next-line no-await-in-loop
              const files = await getFilesInDirectory(dir, vaultFilesFlattened)
              const folderContents: string[] = []
              for (const f of files) {
                if (!seenFiles.has(f.path)) {
                  seenFiles.add(f.path)
                  // eslint-disable-next-line no-await-in-loop
                  const c = await window.fileSystem.readFile(f.path, 'utf-8')
                  folderContents.push(c || '')
                }
              }
              if (folderContents.length > 0) {
                parts.push(`# Folder: ${folderName}`)
                parts.push(folderContents.join('\n\n'))
              }
            }

            // Add loose files not already included via folders
            for (const p of filePaths) {
              if (!seenFiles.has(p)) {
                seenFiles.add(p)
                // eslint-disable-next-line no-await-in-loop
                const c = await window.fileSystem.readFile(p, 'utf-8')
                parts.push(c || '')
              }
            }

            if (parts.length === 0) {
              toast.info('No markdown files found')
              return
            }

            const output = parts.join('\n\n')
            await navigator.clipboard.writeText(output)
            const totalNotes = seenFiles.size
            toast.success(totalNotes > 1 ? `Copied ${totalNotes} notes to clipboard` : 'Markdown copied to clipboard')
          } catch (err) {
            toast.error('Failed to copy markdown')
          }
        }}
      >
        {(() => {
          const inMulti = selectedFilePaths.length > 1 && selectedFilePaths.includes(file.path)
          return inMulti ? `Copy Markdown (${selectedFilePaths.length})` : 'Copy Markdown'
        })()}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => setNoteToBeRenamed(file.path)}>Rename</ContextMenuItem>
      <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
    </>
  )

  return (
    <div style={{ ...style, paddingLeft: `${indentationPadding}px` }}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            <XStack
              hoverStyle={{
                backgroundColor: '$gray7',
              }}
              backgroundColor={isSelected && !isDirectory ? '$gray7' : ''}
              onPress={clickOnFileOrDirectory}
              className={itemClasses}
              overflow="hidden"
              justifyContent="space-between"
              width="100%"
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
              <Text color="$gray11" numberOfLines={1} flex={1}>
                {isDirectory ? file.name : removeFileExtension(file.name)}
              </Text>
              {!isDirectory && (
                <Text
                  color="$gray9"
                  numberOfLines={1}
                  flexShrink={0}
                  textAlign="right"
                  className="ml-2 w-14 whitespace-nowrap text-[10px] opacity-40"
                >
                  {formattedDate}
                </Text>
              )}
            </XStack>
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
