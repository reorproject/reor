import React, { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useFileContext } from '@/contexts/FileContext'

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
      className="mb-1 mt-2 cursor-pointer select-none pl-4 text-[11px] leading-4 text-neutral-400 opacity-30 transition-opacity hover:text-neutral-300 hover:opacity-80"
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
