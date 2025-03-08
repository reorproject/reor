import * as DialogPrimitive from '@radix-ui/react-dialog'
import { styled, YStack, XStack, Text } from 'tamagui'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = styled(DialogPrimitive.Overlay, {
  name: 'DialogOverlay',
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  variants: {
    open: {
      true: {
        animation: 'unset',
      },
      false: {
        animation: 'unset',
      },
    },
  },
})

const DialogContent = styled(DialogPrimitive.Content, {
  name: 'DialogContent',
  backgroundColor: '$background',
  borderRadius: '$3',
  position: 'fixed',
  left: '50%',
  top: '50%',
  zIndex: 60,
  width: '60vw',
  // maxWidth: {
  //   sm: '90%', // For small screens
  //   md: '80%', // For medium screens
  //   lg: '70%', // For large screens
  //   xl: '60%', // For extra-large screens
  // },
  transform: 'translate(-50%, -50%)',
  variants: {
    open: {
      true: {
        animation: 'unset',
      },
      false: {
        animation: 'unset',
      },
    },
  },
})

const DialogHeader = styled(YStack, {
  name: 'DialogHeader',
  space: '$1.5',
  paddingBottom: '$2',
})

const DialogFooter = styled(XStack, {
  name: 'DialogFooter',
  justifyContent: 'flex-end',
  space: '$2',
  paddingTop: '$2',
})

const DialogTitle = styled(Text, {
  name: 'DialogTitle',
  fontSize: '$5',
  fontWeight: 'bold',
})

const DialogDescription = styled(Text, {
  name: 'DialogDescription',
  fontSize: '$2',
  color: '$textSecondary',
})

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
