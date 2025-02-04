import React, { useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { YStack, XStack } from 'tamagui'

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
      >
        {!hideCloseButton && (
          <XStack position="absolute" top={10} right={15}>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none' }}>
              <span style={{ fontSize: 24, cursor: 'pointer' }}>&times;</span>
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
