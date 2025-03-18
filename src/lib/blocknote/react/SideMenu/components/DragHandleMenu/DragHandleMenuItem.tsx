import React from 'react'
import { Menu } from '@mantine/core'
import { PolymorphicComponentProps } from '@mantine/utils'

const DragHandleMenuItem = (props: PolymorphicComponentProps<'button'>) => {
  const { children, ...remainingProps } = props
  return <Menu.Item {...remainingProps}>{children}</Menu.Item>
}

export default DragHandleMenuItem
