import React from 'react'

import { useModalOpeners } from '@/contexts/ModalContext'
import SettingsModal from '../Settings/Settings'
import FlashcardMenuModal from '../Flashcard/FlashcardMenuModal'
import { useFileContext } from '@/contexts/FileContext'
import RenameNoteModal from '../File/RenameNote'
import RenameDirModal from '../File/RenameDirectory'

const CommonModals: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isFlashcardModeOpen,
    setIsFlashcardModeOpen,
    initialFileToCreateFlashcard,
    setInitialFileToCreateFlashcard,
    initialFileToReviewFlashcard,
    setInitialFileToReviewFlashcard,
  } = useModalOpeners()

  const { noteToBeRenamed, fileDirToBeRenamed } = useFileContext()

  return (
    <div>
      {noteToBeRenamed && <RenameNoteModal />}
      {fileDirToBeRenamed && <RenameDirModal />}
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <FlashcardMenuModal
        isOpen={isFlashcardModeOpen}
        onClose={() => {
          setIsFlashcardModeOpen(false)
          setInitialFileToCreateFlashcard('')
          setInitialFileToReviewFlashcard('')
        }}
        initialFileToCreateFlashcard={initialFileToCreateFlashcard}
        initialFileToReviewFlashcard={initialFileToReviewFlashcard}
      />
    </div>
  )
}

export default CommonModals
