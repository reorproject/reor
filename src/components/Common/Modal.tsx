import React, { useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { YStack, XStack } from '@tamagui/stacks'
import { X } from '@tamagui/lucide-icons'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  hideCloseButton?: boolean
}

const ReorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hideCloseButton,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose()
    }
  }
  console.log(`modalRef:`, modalRef)

  const modalContent = (
    <YStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      alignItems="center"
      justifyContent="center"
      backgroundColor="rgba(0, 0, 0, 0.4)"
      height="100vh"
      onClick={handleBackdropClick}
    >
      <YStack
        ref={modalRef}
        borderRadius="$4"
        borderWidth={1}
        borderColor="$gray7"
        backgroundColor="$background"
        shadowColor="$shadowColor"
        shadowOpacity={0.5}
        shadowRadius={10}
        padding="$4"
        onClick={(e) => e.stopPropagation()} 
      >
        {!hideCloseButton && (
          <XStack position="absolute" top={10} right={15}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none' }}>
              <span style={{ fontSize: 24, cursor: 'pointer' }}>
                <X size={18} />
              </span>
            </button>
          </XStack>
        )}
        {children}
      </YStack>
    </YStack>
  )

  return ReactDOM.createPortal(modalContent, document.body)
}

export default ReorModal
