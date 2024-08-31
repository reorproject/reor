import React, { createContext, useContext, ReactNode } from 'react'
import useFileByFilepath from '@/components/File/hooks/use-file-by-filepath'

type FileContextType = ReturnType<typeof useFileByFilepath>

export const FileContext = createContext<FileContextType | undefined>(undefined)

export const useFileContext = () => {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider')
  }
  return context
}

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const fileContextValue = useFileByFilepath()

  return <FileContext.Provider value={fileContextValue}>{children}</FileContext.Provider>
}
