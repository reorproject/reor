import React, { useEffect, useState } from 'react'

import { FileInfoNode, FileInfoTree } from 'electron/main/filesystem/types'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'

import FileItem from './FileItem'
import { isFileNodeDirectory } from './utils'
import RenameNoteModal from '@/components/File/RenameNote'
import RenameDirModal from '@/components/File/RenameDirectory'
import { useFileContext } from '@/providers/FileContext'

const handleDragStartImpl = (e: React.DragEvent, file: FileInfoNode) => {
  e.dataTransfer.setData('text/plain', file.path)
  e.dataTransfer.effectAllowed = 'move'
} // Assuming FileItem is in a separate file

const Rows: React.FC<ListChildComponentProps> = ({ index, style, data }) => {
  const { visibleItems, selectedFilePath, onFileSelect, handleDragStart, handleDirectoryToggle, expandedDirectories } =
    data
  const fileObject = visibleItems[index]
  return (
    <div style={style}>
      <FileItem
        file={fileObject.file}
        selectedFilePath={selectedFilePath}
        onFileSelect={onFileSelect}
        handleDragStart={handleDragStart}
        onDirectoryToggle={handleDirectoryToggle}
        isExpanded={expandedDirectories.has(fileObject.file.path) && expandedDirectories.get(fileObject.file.path)}
        indentMultiplyer={fileObject.indentMultiplyer}
      />
    </div>
  )
}

interface FileExplorerProps {
  files: FileInfoTree
  onFileSelect: (path: string) => void
  handleDragStart: (event: React.DragEvent, file: FileInfoNode) => void
  expandedDirectories: Map<string, boolean>
  handleDirectoryToggle: (path: string) => void
  lheight?: number
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  onFileSelect,
  handleDragStart,
  expandedDirectories,
  handleDirectoryToggle,
  lheight,
}) => {
  const [listHeight, setListHeight] = useState(lheight ?? window.innerHeight)

  const { currentlyOpenFilePath } = useFileContext()
  useEffect(() => {
    const updateHeight = () => {
      setListHeight(lheight ?? window.innerHeight)
    }
    window.addEventListener('resize', updateHeight)
    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [lheight])

  const getVisibleFilesAndFlatten = (
    _files: FileInfoTree,
    _expandedDirectories: Map<string, boolean>,
    indentMultiplyer = 0,
  ): { file: FileInfoNode; indentMultiplyer: number }[] => {
    let visibleItems: { file: FileInfoNode; indentMultiplyer: number }[] = []
    _files.forEach((file) => {
      const a = { file, indentMultiplyer }
      visibleItems.push(a)
      if (isFileNodeDirectory(file) && _expandedDirectories.has(file.path) && _expandedDirectories.get(file.path)) {
        if (file.children) {
          visibleItems = [
            ...visibleItems,
            ...getVisibleFilesAndFlatten(file.children, _expandedDirectories, indentMultiplyer + 1),
          ]
        }
      }
    })
    return visibleItems
  }

  // Calculate visible items and item count
  const visibleItems = getVisibleFilesAndFlatten(files, expandedDirectories)
  const itemCount = visibleItems.length

  return (
    <div className="h-full grow px-1 pt-2 opacity-70">
      <List
        height={listHeight}
        itemCount={itemCount}
        itemSize={30}
        width="100%"
        itemData={{
          visibleItems,
          currentlyOpenFilePath,
          onFileSelect,
          handleDragStart,
          handleDirectoryToggle,
          expandedDirectories,
        }}
      >
        {Rows}
      </List>
    </div>
  )
}

interface FileListProps {
  files: FileInfoTree
  expandedDirectories: Map<string, boolean>
  handleDirectoryToggle: (path: string) => void
  onFileSelect: (path: string) => void
  listHeight?: number
}

export const FileSidebar: React.FC<FileListProps> = ({
  files,
  expandedDirectories,
  handleDirectoryToggle,
  onFileSelect,
  listHeight,
}) => {
  const { noteToBeRenamed, fileDirToBeRenamed } = useFileContext()
  return (
    <div className="flex h-full flex-col overflow-hidden text-white">
      {noteToBeRenamed && <RenameNoteModal />}
      {fileDirToBeRenamed && <RenameDirModal />}
      <FileExplorer
        files={files}
        onFileSelect={onFileSelect}
        handleDragStart={handleDragStartImpl}
        expandedDirectories={expandedDirectories}
        handleDirectoryToggle={handleDirectoryToggle}
        lheight={listHeight}
      />
    </div>
  )
}

export default FileExplorer
