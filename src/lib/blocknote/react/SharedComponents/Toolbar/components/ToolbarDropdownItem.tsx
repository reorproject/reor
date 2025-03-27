import { Menu } from '@mantine/core'
import React, { MouseEvent } from 'react'
import { IconType } from 'react-icons'
import { TiTick } from 'react-icons/ti'

export type ToolbarDropdownItemProps = {
  text: string
  // eslint-disable-next-line react/no-unused-prop-types
  type?: string
  icon?: IconType
  onClick?: (e: MouseEvent) => void
  isSelected?: boolean
  isDisabled?: boolean
}

export const ToolbarDropdownItem = (props: ToolbarDropdownItemProps) => {
  const ItemIcon = props.icon

  return (
    <Menu.Item
      key={props.text}
      onClick={props.onClick}
      icon={ItemIcon && <ItemIcon size={16} />}
      rightSection={
        props.isSelected ? (
          <TiTick size={16} />
        ) : (
          // Ensures space for tick even if item isn't currently selected.
          <div style={{ width: '16px', padding: '0' }} />
        )
      }
      disabled={props.isDisabled}
    >
      {props.text}
    </Menu.Item>
  )
}
