import React, { useEffect, useState } from 'react'

import { FileInfoNode, FileInfoTree } from 'electron/main/filesystem/types'
import { FixedSizeList as List, ListChildComponentProps } from 'react-window'

import RenameDirModal from '../RenameDirectory'
import RenameNoteModal from '../RenameNote'

import { FileItem } from './FileItem'
import { isFileNodeDirectory } from './fileOperations'

interface FileListProps {
  files: FileInfoTree
  expandedDirectories: Map<string, boolean>
  handleDirectoryToggle: (path: string) => void
  selectedFilePath: string | null
  onFileSelect: (path: string) => void
  renameFile: (oldFilePath: string, newFilePath: string) => Promise<void>
  noteToBeRenamed: string
  setNoteToBeRenamed: (note: string) => void
  fileDirToBeRenamed: string
  setFileDirToBeRenamed: (dir: string) => void
  listHeight?: number
}

export const FileSidebar: React.FC<FileListProps> = ({
  files,
  expandedDirectories,
  handleDirectoryToggle,
  selectedFilePath,
  onFileSelect,
  renameFile,
  noteToBeRenamed,
  setNoteToBeRenamed,
  fileDirToBeRenamed,
  setFileDirToBeRenamed,
  listHeight,
}) => (
  <div className="flex h-full flex-col overflow-hidden text-white">
    {noteToBeRenamed && (
      <RenameNoteModal
        isOpen={!!noteToBeRenamed}
        onClose={() => setNoteToBeRenamed('')}
        fullNoteName={noteToBeRenamed}
        renameNote={async ({ path, newNoteName }) => {
          await renameFile(path, newNoteName)
        }}
      />
    )}
    {fileDirToBeRenamed && (
      <RenameDirModal
        isOpen={!!fileDirToBeRenamed}
        onClose={() => setFileDirToBeRenamed('')}
        fullDirName={fileDirToBeRenamed}
        renameDir={async ({ path, newDirName: newNoteName }) => {
          await renameFile(path, newNoteName)
        }}
      />
    )}
    <FileExplorer
      files={files}
      selectedFilePath={selectedFilePath}
      onFileSelect={onFileSelect}
      handleDragStart={handleDragStartImpl}
      expandedDirectories={expandedDirectories}
      handleDirectoryToggle={handleDirectoryToggle}
      lheight={listHeight}
    />
  </div>
)

const handleDragStartImpl = (e: React.DragEvent, file: FileInfoNode) => {
  e.dataTransfer.setData('text/plain', file.path)
  e.dataTransfer.effectAllowed = 'move'
}

interface FileExplorerProps {
  files: FileInfoTree
  selectedFilePath: string | null
  onFileSelect: (path: string) => void
  handleDragStart: (e: React.DragEvent, file: FileInfoNode) => void
  expandedDirectories: Map<string, boolean>
  handleDirectoryToggle: (path: string) => void
  lheight?: number
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFilePath,
  onFileSelect,
  handleDragStart,
  expandedDirectories,
  handleDirectoryToggle,
  lheight,
}) => {
  const [listHeight, setListHeight] = useState(lheight ?? window.innerHeight)

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(lheight ?? window.innerHeight)
    }

    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  const getVisibleFilesAndFlatten = (
    files: FileInfoTree,
    expandedDirectories: Map<string, boolean>,
    indentMultiplyer = 0,
  ): { file: FileInfoNode; indentMultiplyer: number }[] => {
    let visibleItems: { file: FileInfoNode; indentMultiplyer: number }[] = []
    files.forEach((file) => {
      const a = { file, indentMultiplyer }
      visibleItems.push(a)
      if (isFileNodeDirectory(file) && expandedDirectories.has(file.path) && expandedDirectories.get(file.path)) {
        if (file.children) {
          visibleItems = [
            ...visibleItems,
            ...getVisibleFilesAndFlatten(file.children, expandedDirectories, indentMultiplyer + 1),
          ]
        }
      }
    })
    return visibleItems
  }

  const handleMenuContext = (e: React.MouseEvent) => {
    e.preventDefault()
    window.electronUtils.showMenuItemContext()
  }

  // Calculate visible items and item count
  const visibleItems = getVisibleFilesAndFlatten(files, expandedDirectories)
  const itemCount = visibleItems.length

  const Rows: React.FC<ListChildComponentProps> = ({ index, style }) => {
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

  return (
    <div
      onContextMenu={handleMenuContext}
      className="overflow-y-none h-full grow"
      // style={hideScrollbarStyle}
    >
      {/* <style>{webKitScrollBarStyles}</style> */}
      <List height={listHeight} itemCount={itemCount} itemSize={30} width="100%" style={{ padding: 0, margin: 0 }}>
        {Rows}
      </List>
    </div>
  )
}
