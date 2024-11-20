import React, { useEffect, useState } from 'react'

interface FileAutocompleteProps {
  searchTerm: string
  position: { top: number; left: number }
  onSelect: (filePath: { absolutePath: string; relativePath: string }) => void
  visible: boolean
}

const FileAutocomplete: React.FC<FileAutocompleteProps> = ({ searchTerm, position, onSelect, visible }) => {
  const [files, setFiles] = useState<Array<{ absolutePath: string; relativePath: string }>>([])

  useEffect(() => {
    const searchFiles = async () => {
      if (searchTerm && visible) {
        const results = await window.fileSystem.searchFiles(searchTerm)
        setFiles(results)
      }
    }
    searchFiles()
  }, [searchTerm, visible])

  if (!visible || !searchTerm) return null

  const formatFilePath = (relativePath: string) => {
    const parts = relativePath.split('/')
    const fileName = parts.pop() || ''
    const folderPath = parts.join('/')
    return (
      <div className="flex items-center justify-between">
        <span>{fileName}</span>
        <span className="ml-2 truncate text-xs text-neutral-500">{folderPath ? `(${folderPath})` : ''}</span>
      </div>
    )
  }

  return (
    <div
      className="absolute z-50 max-h-48 w-64 overflow-y-auto rounded-md border border-neutral-700 bg-background shadow-lg"
      style={{
        top: 'auto',
        bottom: `calc(100% + 10px)`,
        left: position.left,
      }}
    >
      {files.map((file) => {
        return (
          <div
            key={file.absolutePath}
            className="cursor-pointer px-4 py-2 hover:bg-neutral-700"
            onClick={() => onSelect({ absolutePath: file.absolutePath, relativePath: file.relativePath })}
          >
            {formatFilePath(file.relativePath)}
          </div>
        )
      })}
    </div>
  )
}

export default FileAutocomplete
