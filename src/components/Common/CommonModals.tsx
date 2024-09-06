import React from 'react'

import NewNoteComponent from '../File/NewNote'
import { useModalOpeners } from '@/contexts/ModalContext'
import NewDirectoryComponent from '../File/NewDirectory'
import SettingsModal from '../Settings/Settings'
import FlashcardMenuModal from '../Flashcard/FlashcardMenuModal'

const CommonModals: React.FC = () => {
  const {
    isNewNoteModalOpen,
    setIsNewNoteModalOpen,
    isNewDirectoryModalOpen,
    setIsNewDirectoryModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isFlashcardModeOpen,
    setIsFlashcardModeOpen,
    initialFileToCreateFlashcard,
    setInitialFileToCreateFlashcard,
    initialFileToReviewFlashcard,
    setInitialFileToReviewFlashcard,
  } = useModalOpeners()

  return (
    <div>
      <NewNoteComponent isOpen={isNewNoteModalOpen} onClose={() => setIsNewNoteModalOpen(false)} />
      <NewDirectoryComponent isOpen={isNewDirectoryModalOpen} onClose={() => setIsNewDirectoryModalOpen(false)} />
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
