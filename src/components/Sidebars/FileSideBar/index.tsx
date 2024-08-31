import React from 'react'

import RenameNoteModal from '@/components/File/RenameNote'
import RenameDirModal from '@/components/File/RenameDirectory'
import { useFileContext } from '@/providers/FileContext'
import FileExplorer from './FileExplorer'

interface FileListProps {
  onFileSelect: (path: string) => void
  listHeight?: number
}

const FileSidebar: React.FC<FileListProps> = ({ onFileSelect, listHeight }) => {
  const { noteToBeRenamed, fileDirToBeRenamed } = useFileContext()
  return (
    <div className="flex h-full flex-col overflow-hidden text-white">
      {noteToBeRenamed && <RenameNoteModal />}
      {fileDirToBeRenamed && <RenameDirModal />}
      <FileExplorer onFileSelect={onFileSelect} lheight={listHeight} />
    </div>
  )
}

export default FileSidebar
