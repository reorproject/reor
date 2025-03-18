import React from 'react'
import { Menu } from '@mantine/core'
import { MdDragIndicator } from 'react-icons/md'
import { BlockSchema } from '@/lib/blocknote/core'
import DefaultDragHandleMenu from '../DragHandleMenu/DefaultDragHandleMenu'
import { SideMenuButton } from '../SideMenuButton'
import { SideMenuProps } from '../SideMenuPositioner'

const DragHandle = <BSchema extends BlockSchema>(props: SideMenuProps<BSchema>) => {
  const DragHandleMenu = props.dragHandleMenu || DefaultDragHandleMenu

  return (
    <Menu trigger="click" onOpen={props.freezeMenu} onClose={props.unfreezeMenu} width={100} position="left">
      <Menu.Target>
        <div draggable="true" onDragStart={props.blockDragStart} onDragEnd={props.blockDragEnd}>
          <SideMenuButton>
            <MdDragIndicator size={24} data-test="dragHandle" />
          </SideMenuButton>
        </div>
      </Menu.Target>
      <DragHandleMenu editor={props.editor} block={props.block} />
    </Menu>
  )
}

export default DragHandle
