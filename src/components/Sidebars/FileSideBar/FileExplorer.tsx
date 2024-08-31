import React, { useEffect, useState } from 'react'

import { FileInfoNode, FileInfoTree } from 'electron/main/filesystem/types'
import { FixedSizeList as List } from 'react-window'

import { isFileNodeDirectory } from './utils'
import { useFileContext } from '@/providers/FileContext'
import FileItemRows from './Rows'

interface FileExplorerProps {
  onFileSelect: (path: string) => void
  lheight?: number
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect, lheight }) => {
  const [listHeight, setListHeight] = useState(lheight ?? window.innerHeight)

  const { files, expandedDirectories } = useFileContext()

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
          onFileSelect,
        }}
      >
        {FileItemRows}
      </List>
    </div>
  )
}

export default FileExplorer
