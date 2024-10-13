import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'

interface ModalProviderProps {
  children: ReactNode
}

/**
 * Every modal requires a setter and opener
 */
interface ModalOpenContextType {
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

const ModalContext = createContext<ModalOpenContextType | undefined>(undefined)

export const useModalOpeners = (): ModalOpenContextType => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModalOpeners must be used within a ModalProvider')
  }
  return context
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isFlashcardModeOpen, setIsFlashcardModeOpen] = useState(false)
  const [initialFileToCreateFlashcard, setInitialFileToCreateFlashcard] = useState('')
  const [initialFileToReviewFlashcard, setInitialFileToReviewFlashcard] = useState('')

  useEffect(() => {
    const createFlashcardFileListener = window.ipcRenderer.receive(
      'create-flashcard-file-listener',
      (noteName: string) => {
        setIsFlashcardModeOpen(!!noteName)
        setInitialFileToCreateFlashcard(noteName)
      },
    )

    return () => {
      createFlashcardFileListener()
    }
  }, [setIsFlashcardModeOpen, setInitialFileToCreateFlashcard])

  // const renameDirectory = useCallback((parentDirectory?: string) => {
  //   setIsNewDirectoryModalOpen(true)
  //   setInitialFileToCreateFlashcard(parentDirectory)
  // }, [])

  const modalOpenContextValue = useMemo(
    () => ({
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
