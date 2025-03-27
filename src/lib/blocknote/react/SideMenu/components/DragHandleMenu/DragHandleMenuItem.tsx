import React from 'react'
import { PolymorphicComponentProps } from '@mantine/utils'
import { ThemedMenuItem } from '@/components/ui/ThemedMenu'

const DragHandleMenuItem = (props: PolymorphicComponentProps<'button'>) => {
  const { children, ...remainingProps } = props
  return <ThemedMenuItem {...remainingProps}>{children}</ThemedMenuItem>
}

export default DragHandleMenuItem
