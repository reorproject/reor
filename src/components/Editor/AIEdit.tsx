/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

interface AiEditMenuProps {
  selectedText: string
  onEdit: (newText: string) => void
}

const AiEditMenu = ({ selectedText, onEdit }: AiEditMenuProps) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        className="z-50 flex w-full flex-col overflow-hidden rounded border-2 border-solid border-border bg-background text-white focus-within:ring-1 focus-within:ring-ring"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
    </div>
  )
}

export default AiEditMenu
