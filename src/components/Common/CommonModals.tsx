import React from 'react'

import { useModalOpeners } from '@/contexts/ModalContext'
import SettingsModal from '../Settings/Settings'
import { useFileContext } from '@/contexts/FileContext'
import RenameNoteModal from '../File/RenameNote'
import RenameDirModal from '../File/RenameDirectory'

const CommonModals: React.FC = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useModalOpeners()

  const { noteToBeRenamed, fileDirToBeRenamed } = useFileContext()

  return (
    <div>
      {noteToBeRenamed && <RenameNoteModal />}
      {fileDirToBeRenamed && <RenameDirModal />}
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  )
}

export default CommonModals
