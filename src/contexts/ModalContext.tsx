import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react'

interface ModalProviderProps {
  children: ReactNode
}

interface ModalOpenContextType {
  isNewDirectoryModalOpen: boolean
  setIsNewDirectoryModalOpen: (newDirectoryOpen: boolean) => void
  isSettingsModalOpen: boolean
  setIsSettingsModalOpen: (settingsOpen: boolean) => void
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

  const modalOpenContextValue = useMemo(
    () => ({
      isNewDirectoryModalOpen,
      setIsNewDirectoryModalOpen,
      isSettingsModalOpen,
      setIsSettingsModalOpen,
    }),
    [isNewDirectoryModalOpen, isSettingsModalOpen],
  )

  return <ModalContext.Provider value={modalOpenContextValue}>{children}</ModalContext.Provider>
}

export default ModalProvider
