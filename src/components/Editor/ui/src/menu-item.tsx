import React from 'react'
import { ListItem, ListItemProps } from '@tamagui/list-item'
import { SizableText } from '@tamagui/text'

const MenuItem: React.FC<ListItemProps> = ({ disabled, title, icon, iconAfter, children, ...props }) => {
  return (
    <ListItem
      hoverTheme
      pressTheme
      size="$2"
      focusTheme
      paddingVertical="$2"
      paddingHorizontal="$4"
      textAlign="left"
      outlineColor="transparent"
      space="$2"
      opacity={disabled ? 0.5 : 1}
      userSelect="none"
      cursor={disabled ? 'not-allowed' : 'default'}
      title={
        title ? (
          <SizableText
            fontSize="$2"
            cursor={disabled ? 'not-allowed' : 'default'}
            userSelect="none"
            color={props.color}
          >
            {title}
          </SizableText>
        ) : undefined
      }
      icon={icon}
      iconAfter={iconAfter}
      {...props}
    >
      {children}
    </ListItem>
  )
}

export default MenuItem
