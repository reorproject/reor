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

const FileItemRows: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
  const { visibleItems } = data
  const fileObject = visibleItems[index]

  const { handleDirectoryToggle, expandedDirectories, currentlyOpenFilePath } = useFileContext()
  const { openContent, showContextMenu } = useContentContext()

  const [isDragOver, setIsDragOver] = useState(false)

  const isDirectory = isFileNodeDirectory(fileObject.file)
  const isSelected = fileObject.file.path === currentlyOpenFilePath
  const indentation = fileObject.indentMultiplyer ? 10 * fileObject.indentMultiplyer : 0
  const isExpanded = expandedDirectories.has(fileObject.file.path) && expandedDirectories.get(fileObject.file.path)

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
    let destinationPath = fileObject.file.path
    if (!isFileNodeDirectory(fileObject.file)) {
      const pathSegments = fileObject.file.path.split('/')
      pathSegments.pop()
      destinationPath = pathSegments.join('/')
    }
    moveFile(sourcePath, destinationPath)
    // Refresh file list here or in moveFile function
  }

  const toggle = () => {
    if (isDirectory) {
      handleDirectoryToggle(fileObject.file.path)
    } else {
      openContent(fileObject.file.path)
      posthog.capture('open_file_from_sidebar')
    }
  }

  const localHandleDragStart = (e: React.DragEvent) => {
    e.stopPropagation()
    handleDragFile(e, fileObject.file)
  }

  const showContextMenuOnDirOrFile = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (isDirectory) showContextMenu(event, 'DirectoryItem', { file: fileObject.file })
    else showContextMenu(event, 'FileItem', { file: fileObject.file })
  }

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 text-cyan-100 font-sans text-xs leading-relaxed rounded-md ${
    isSelected ? 'bg-neutral-700 text-white font-semibold' : 'text-gray-200'
  } ${isDragOver ? 'bg-neutral-500' : ''}`

  return (
    <div style={{ ...style, paddingLeft: `${indentation}px` }}>
      <div
        draggable
        onDragStart={localHandleDragStart}
        onContextMenu={showContextMenuOnDirOrFile}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        <div onClick={toggle} className={itemClasses}>
          {isDirectory && (
            <span className="mr-2 mt-1 text-gray-200/20 ">
              {isExpanded ? <FaChevronDown title="Collapse Directory" /> : <FaChevronRight title="Open Directory" />}
            </span>
          )}
          <span className="mt-0 flex-1 truncate">
            {isDirectory ? fileObject.file.name : removeFileExtension(fileObject.file.name)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FileItemRows
