import { useState } from 'react'

export const usePopoverState = (defaultOpen?: boolean, afterOpenChange?: (value: boolean) => void) => {
  const [open, onOpenChange] = useState<boolean>(!!defaultOpen)
  return {
    open,
    onOpenChange: (value: boolean) => {
      onOpenChange(value)
      afterOpenChange?.(value)
    },
    defaultOpen: !!defaultOpen,
  }
}
