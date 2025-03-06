import React, { useEffect, useState } from 'react'
import { FileInfoNode, FileInfoTree } from 'electron/main/filesystem/types'
import { FixedSizeList } from 'react-window'
import { isFileNodeDirectory } from '@shared/utils'
import { YStack } from 'tamagui'
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
  // const { state, actions } = useThemeManager()
  const [listHeight, setListHeight] = useState(lheight ?? window.innerHeight - 50)
  const { vaultFilesTree, expandedDirectories, renameFile, setSelectedDirectory } = useFileContext()

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const sourcePath = e.dataTransfer.getData('text/plain')
    const destinationDirectory = await window.electronStore.getVaultDirectoryForWindow()
    const destinationPath = await window.path.join(destinationDirectory, await window.path.basename(sourcePath))
    renameFile(sourcePath, destinationPath)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleClick = () => {
    setSelectedDirectory(null)
  }

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
    <YStack backgroundColor="$gray3" color="$gray11">
      <div className="h-full grow px-1 pt-2 " onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleClick}>
        <FixedSizeList
          height={listHeight}
          itemCount={itemCount}
          itemSize={30}
          width="100%"
          itemData={{
            filesAndIndentations,
          }}
        >
          {FileItemRows}
        </FixedSizeList>
      </div>
    </YStack>
  )
}

export default FileSidebar
