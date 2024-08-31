import React from 'react'

import RenameNoteModal from '@/components/File/RenameNote'
import RenameDirModal from '@/components/File/RenameDirectory'
import { useFileContext } from '@/providers/FileContext'
import FileExplorer from './FileExplorer'

interface FileSidebarProps {
  listHeight?: number
}

const FileSidebar: React.FC<FileSidebarProps> = ({ listHeight }) => {
  const { noteToBeRenamed, fileDirToBeRenamed } = useFileContext()
  return (
    <div className="flex h-full flex-col overflow-hidden text-white">
      {noteToBeRenamed && <RenameNoteModal />}
      {fileDirToBeRenamed && <RenameDirModal />}
      <FileExplorer lheight={listHeight} />
    </div>
  )
}

export default FileSidebar
