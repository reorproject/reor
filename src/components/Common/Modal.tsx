import React, { useRef, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  hideCloseButton?: boolean
  tailwindStylesOnBackground?: string
}

const ReorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hideCloseButton,
  tailwindStylesOnBackground,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  // const widthClass = getDimension(widthType as ModalWidthType);

  useEffect(() => {
    const handleOffClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOffClick)
    return () => {
      document.removeEventListener('mousedown', handleOffClick)
    }
  }, [onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex h-full items-center justify-center bg-black/40 ${tailwindStylesOnBackground}`}
    >
      <div
        ref={modalRef}
        className="flex max-w-4xl  flex-col items-center justify-center rounded-lg border border-solid border-gray-600 bg-dark-gray-c-three shadow-xl"
      >
        <div className="z-50 h-0 w-full items-end border-b border-gray-700 px-4">
          {!hideCloseButton && (
            <div className="m-2 flex justify-end">
              <button
                onClick={onClose}
                className="flex size-5 cursor-pointer items-center justify-center border-none bg-transparent text-gray-600 hover:bg-slate-700/40"
                type="button"
              >
                <span className="text-3xl leading-none">&times;</span>
              </button>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export default ReorModal