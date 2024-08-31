import React, { createContext, useContext, ReactNode } from 'react'
import useFileByFilepath from '@/components/File/hooks/use-file-by-filepath'
import useFileInfoTree from '@/components/Sidebars/FileSideBar/hooks/use-file-info-tree'

type FileByFilepathType = ReturnType<typeof useFileByFilepath>
type FileInfoTreeType = ReturnType<typeof useFileInfoTree>

type FileContextType = FileByFilepathType & FileInfoTreeType

export const FileContext = createContext<FileContextType | undefined>(undefined)

export const useFileContext = () => {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider')
  }
  return context
}

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const fileByFilepathValue = useFileByFilepath()
  const fileInfoTreeValue = useFileInfoTree(fileByFilepathValue.currentlyOpenFilePath)

  const combinedContextValue: FileContextType = React.useMemo(
    () => ({
      ...fileByFilepathValue,
      ...fileInfoTreeValue,
    }),
    [fileByFilepathValue, fileInfoTreeValue],
  )

  return <FileContext.Provider value={combinedContextValue}>{children}</FileContext.Provider>
}
