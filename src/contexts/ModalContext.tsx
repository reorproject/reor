import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'

interface ModalProviderProps {
  children: ReactNode
}

/**
 * Every modal requires a setter and opener
 */
interface ModalOpenContextType {
  isNewNoteModalOpen: boolean
  setIsNewNoteModalOpen: (newNote: boolean) => void
  isNewDirectoryModalOpen: boolean
  setIsNewDirectoryModalOpen: (newDir: boolean) => void
  isSettingsModalOpen: boolean
  setIsSettingsModalOpen: (settingsOpen: boolean) => void
  isFlashcardModeOpen: boolean
  setIsFlashcardModeOpen: (flashcardOpen: boolean) => void
  initialFileToCreateFlashcard: string
  setInitialFileToCreateFlashcard: (flashcardName: string) => void
  initialFileToReviewFlashcard: string
  setInitialFileToReviewFlashcard: (flashcardName: string) => void
}

const defaultModalContext: ModalOpenContextType = {
  isNewNoteModalOpen: false,
  setIsNewNoteModalOpen: () => {},
  isNewDirectoryModalOpen: false,
  setIsNewDirectoryModalOpen: () => {},
  isSettingsModalOpen: false,
  setIsSettingsModalOpen: () => {},
  isFlashcardModeOpen: false,
  setIsFlashcardModeOpen: () => {},
  initialFileToCreateFlashcard: '',
  setInitialFileToCreateFlashcard: () => {},
  initialFileToReviewFlashcard: '',
  setInitialFileToReviewFlashcard: () => {},
}

const ModalContext = createContext<ModalOpenContextType>(defaultModalContext)

export const useModalOpeners = (): ModalOpenContextType => useContext(ModalContext)

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false)
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isFlashcardModeOpen, setIsFlashcardModeOpen] = useState(false)
  const [initialFileToCreateFlashcard, setInitialFileToCreateFlashcard] = useState('')
  const [initialFileToReviewFlashcard, setInitialFileToReviewFlashcard] = useState('')

  const modalOpenContextValue = useMemo(
    () => ({
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
    }),
    [
      isNewNoteModalOpen,
      isNewDirectoryModalOpen,
      isSettingsModalOpen,
      isFlashcardModeOpen,
      initialFileToReviewFlashcard,
      initialFileToCreateFlashcard,
    ],
  )

  return <ModalContext.Provider value={modalOpenContextValue}>{children}</ModalContext.Provider>
}

export default ModalProvider
