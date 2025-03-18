import React from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { BlockSchema } from '@/lib/blocknote/core'
import { SideMenuButton } from '../SideMenuButton'
import { SideMenuProps } from '../SideMenuPositioner'

const AddBlockButton = <BSchema extends BlockSchema>(props: SideMenuProps<BSchema>) => (
  <SideMenuButton>
    <AiOutlinePlus size={24} onClick={props.addBlock} data-test="dragHandleAdd" />
  </SideMenuButton>
)

export default AddBlockButton
