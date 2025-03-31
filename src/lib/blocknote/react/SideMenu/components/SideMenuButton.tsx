import React from 'react'
import { XStack } from 'tamagui'

const SideMenuButton = (props: { children: JSX.Element }) => (
  <XStack
    cursor="pointer"
    padding="$1"
    hoverStyle={{
      backgroundColor: '$gray5',
      borderRadius: '$2',
    }}
  >
    {props.children}
  </XStack>
)

export default SideMenuButton
