import { Group } from '@mantine/core'
import React, { ReactNode } from 'react'

const SideMenu = (props: { children: ReactNode }) => {
  return (
    <Group className="side-menu" spacing={0}>
      {props.children}
    </Group>
  )
}

export default SideMenu
