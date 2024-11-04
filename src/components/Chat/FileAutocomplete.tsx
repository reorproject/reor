import React, { useEffect, useState } from 'react'

interface FileAutocompleteProps {
  searchTerm: string
  position: { top: number; left: number }
  onSelect: (filePath: string) => void
  visible: boolean
}

const FileAutocomplete: React.FC<FileAutocompleteProps> = ({ searchTerm, position, onSelect, visible }) => {
  const [files, setFiles] = useState<string[]>([])

  useEffect(() => {
    const searchFiles = async () => {
      if (searchTerm && visible) {
        // Use the electron API to search for files
        const results = await window.fileSystem.searchFiles(searchTerm)
        setFiles(results)
      }
    }
    searchFiles()
  }, [searchTerm, visible])

  if (!visible || !searchTerm) return null

  return (
    <div
      className="absolute z-50 max-h-48 w-64 overflow-y-auto rounded-md border border-neutral-700 bg-background shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      {files.map((file) => (
        <div key={file} className="cursor-pointer px-4 py-2 hover:bg-neutral-700" onClick={() => onSelect(file)}>
          {file.split('/').pop()}
        </div>
      ))}
    </div>
  )
}

export default FileAutocomplete
