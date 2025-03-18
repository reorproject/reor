import React from 'react'
import { BlockSchema } from '@/lib/blocknote/core'
import DragHandle from './DefaultButtons/DragHandle'
import { SideMenu } from './SideMenu'
import { SideMenuProps } from './SideMenuPositioner'
import AddBlockButton from './DefaultButtons/AddBlockButton'

const DefaultSideMenu = <BSchema extends BlockSchema>(props: SideMenuProps<BSchema>) => (
  <SideMenu>
    <AddBlockButton {...props} />
    <DragHandle {...props} />
  </SideMenu>
)

export default DefaultSideMenu
