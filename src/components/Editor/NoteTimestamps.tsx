import React, { useMemo, useState } from 'react'
import { useFileContext } from '@/contexts/FileContext'
import { format } from 'date-fns'

const NoteTimestamps: React.FC = () => {
  const { currentlyOpenFilePath, vaultFilesFlattened } = useFileContext()
  const [showUpdated, setShowUpdated] = useState(false)

  const fileInfo = useMemo(() => {
    if (!currentlyOpenFilePath) return null
    return vaultFilesFlattened.find((f) => f.path === currentlyOpenFilePath) || null
  }, [currentlyOpenFilePath, vaultFilesFlattened])

  if (!fileInfo) return null

  const createdAt = fileInfo.dateCreated
  const updatedAt = fileInfo.dateModified

  const label = showUpdated ? 'Updated' : 'Created'
  const date = showUpdated ? updatedAt : createdAt
  const display = date instanceof Date ? format(date, 'yyyy-MM-dd HH:mm') : String(date)

  return (
    <div
      className="mb-1 select-none text-[11px] leading-4 opacity-60 transition-opacity hover:opacity-90 text-neutral-400 hover:text-neutral-300 cursor-pointer"
      onClick={() => setShowUpdated((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setShowUpdated((prev) => !prev)
      }}
    >
      {label}: {display}
    </div>
  )
}

export default NoteTimestamps

