import React from 'react'

import { useModalOpeners } from '@/contexts/ModalContext'
import SettingsModal from '../Settings/Settings'
import { useFileContext } from '@/contexts/FileContext'
import RenameNoteModal from '../File/RenameNote'
import RenameDirModal from '../File/RenameDirectory'
import NewDirectoryComponent from '../File/NewDirectory'

const CommonModals: React.FC = () => {
  const { isNewDirectoryModalOpen, setIsNewDirectoryModalOpen, isSettingsModalOpen, setIsSettingsModalOpen } =
    useModalOpeners()

  const { noteToBeRenamed, fileDirToBeRenamed } = useFileContext()

  return (
    <div>
      <NewDirectoryComponent isOpen={isNewDirectoryModalOpen} onClose={() => setIsNewDirectoryModalOpen(false)} />
      {noteToBeRenamed && <RenameNoteModal />}
      {fileDirToBeRenamed && <RenameDirModal />}
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  )
}

export default CommonModals
