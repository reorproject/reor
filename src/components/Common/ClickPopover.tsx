import React, { useEffect, useRef } from 'react'

interface ClickPopoverProps {
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  isOpen: boolean
  onClose: () => void
}

const ClickPopover: React.FC<ClickPopoverProps> = ({ children, position = 'top', isOpen, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null)

  const positionClasses = {
    top: 'bottom-full left-0 mb-2',
    bottom: 'top-full left-0 mt-2',
    left: 'right-full top-0 mr-2',
    right: 'left-full top-0 ml-2',
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    isOpen && (
      <div
        className={`absolute ${positionClasses[position]} z-10 cursor-default rounded border p-4 shadow-lg`}
        ref={popoverRef}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    )
  )
}

export default ClickPopover
