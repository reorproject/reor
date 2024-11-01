import React, { useEffect, useState } from 'react'
import { FileInfoNode, FileInfoTree } from 'electron/main/filesystem/types'
import { FixedSizeList } from 'react-window'
import { isFileNodeDirectory } from '@shared/utils'
import { useFileContext } from '@/contexts/FileContext'
import FileItemRows from './FileItemRows'

const getFilesAndIndentationsForSidebar = (
  files: FileInfoTree,
  expandedDirectories: Map<string, boolean>,
  indentation = 0,
): { file: FileInfoNode; indentation: number }[] => {
  let filesAndIndexes: { file: FileInfoNode; indentation: number }[] = []
  files.forEach((file) => {
    filesAndIndexes.push({ file, indentation })
    if (isFileNodeDirectory(file) && expandedDirectories.has(file.path) && expandedDirectories.get(file.path)) {
      if (file.children) {
        filesAndIndexes = [
          ...filesAndIndexes,
          ...getFilesAndIndentationsForSidebar(file.children, expandedDirectories, indentation + 1),
        ]
      }
    }
  })
  return filesAndIndexes
}

interface FileExplorerProps {
  lheight?: number
}

const FileSidebar: React.FC<FileExplorerProps> = ({ lheight }) => {
  const [listHeight, setListHeight] = useState(lheight ?? window.innerHeight - 50)
  const { vaultFilesTree, expandedDirectories } = useFileContext()

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(lheight ?? window.innerHeight - 50)
    }
    window.addEventListener('resize', updateHeight)
    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [lheight])

  const filesAndIndentations = getFilesAndIndentationsForSidebar(vaultFilesTree, expandedDirectories)
  const itemCount = filesAndIndentations.length

  return (
    <div className="h-full grow bg-pink-200 px-1 pt-2 opacity-70">
      <FixedSizeList
        height={listHeight}
        itemCount={itemCount}
        itemSize={30}
        width="100%"
        style={{ backgroundColor: 'pink' }}
        itemData={{
          filesAndIndentations,
        }}
      >
        {FileItemRows}
      </FixedSizeList>
    </div>
  )
}

export default FileSidebar
