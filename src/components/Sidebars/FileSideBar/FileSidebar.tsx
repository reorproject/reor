import React, { useEffect, useState } from 'react'
import { FileInfoNode, FileInfoTree } from 'electron/main/filesystem/types'
import { FixedSizeList } from 'react-window'
import { isFileNodeDirectory } from '@shared/utils'
import { XStack, YStack } from 'tamagui'
import { Calendar } from '@tamagui/lucide-icons'
import { HiOutlinePencilAlt } from 'react-icons/hi'
import { VscNewFolder } from 'react-icons/vsc'
import { useFileContext } from '@/contexts/FileContext'
import { useModalOpeners } from '@/contexts/ModalContext'
import { useContentContext } from '@/contexts/ContentContext'
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
  const [showDates, setShowDates] = useState<boolean>(true)
  const { setIsNewDirectoryModalOpen } = useModalOpeners()
  const { createUntitledNote } = useContentContext()

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

  useEffect(() => {
    const init = async () => {
      const val = await window.electronStore.getFileIndexDateVisibility()
      setShowDates(val)
    }
    init()

    const handler = (_e: any, val: boolean) => setShowDates(val)
    window.ipcRenderer.on('file-index-date-visibility-changed', handler)
  }, [])

  const filesAndIndentations = getFilesAndIndentationsForSidebar(vaultFilesTree, expandedDirectories)
  const itemCount = filesAndIndentations.length
  return (
    <YStack className="h-full grow px-1 pt-2" backgroundColor="$gray3">
      <XStack className="mb-1 items-center justify-between px-1">
        <XStack className="items-center gap-1">
          <YStack
            alignItems="center"
            justifyContent="center"
            hoverStyle={{ backgroundColor: '$gray7' }}
            className="size-5 cursor-pointer rounded opacity-60 hover:opacity-90"
            onPress={() => createUntitledNote()}
          >
            <HiOutlinePencilAlt className="text-gray-300" color="gray" size={16} title="New Note" />
          </YStack>
          <YStack
            alignItems="center"
            justifyContent="center"
            hoverStyle={{ backgroundColor: '$gray7' }}
            className="size-5 cursor-pointer rounded opacity-60 hover:opacity-90"
            onPress={() => setIsNewDirectoryModalOpen(true)}
          >
            <VscNewFolder className="text-gray-300" color="gray" size={16} title="New Directory" />
          </YStack>
        </XStack>
        <YStack
          alignItems="center"
          justifyContent="center"
          hoverStyle={{ backgroundColor: '$gray7' }}
          className={`size-5 cursor-pointer rounded ${showDates ? 'opacity-90' : 'opacity-30'}`}
          onPress={async () => {
            const next = !showDates
            setShowDates(next)
            await window.electronStore.setFileIndexDateVisibility(next)
          }}
        >
          <Calendar size={14} color={showDates ? '$gray11' : '$gray9'} />
        </YStack>
      </XStack>
      <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleClick}>
        <FixedSizeList
          height={listHeight}
          itemCount={itemCount}
          itemSize={30}
          width="100%"
          itemData={{
            filesAndIndentations,
            showDates,
          }}
        >
          {FileItemRows}
        </FixedSizeList>
      </div>
    </YStack>
  )
}

export default FileSidebar
