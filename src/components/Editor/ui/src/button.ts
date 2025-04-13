import { Button as TButton } from '@tamagui/button'
import { ThemeableStack } from '@tamagui/stacks'
import { styled } from '@tamagui/web'

export const Button = styled(TButton, {
  className: 'btn',
  // bg: "$color4",
  borderWidth: 2,
  // bg: "$color4",
  // borderColor: "$color5",
  // hoverStyle: {
  //   bg: "$color5",
  //   borderColor: "$color6",
  //   elevation: 0,
  // },
  disabledStyle: {
    opacity: 0.5,
    borderWidth: 2,
    borderColor: '$colorTransparent',
    elevation: 0,
  },

  focusStyle: {
    borderColor: '$color8',
    borderWidth: 2,
    elevation: 0,
  },
  hoverStyle: {
    cursor: 'default',
  },
})

export const AccountTypeButton = styled(ThemeableStack, {
  tag: 'button',
  role: 'button',
  focusable: true,
  p: '$4',
  paddingBottom: '$2',
  w: 150,
  h: 150,
  borderRadius: '$2',
  gap: '$2',
  bg: '$color4',
  hoverStyle: {
    bg: '$color6',
  },
})

export const StyledIconButton = styled(Button, {
  name: 'StyledIconButton',
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  size: 20,
  minWidth: 0,
  aspectRatio: 1,
  alignItems: 'center',
  justifyContent: 'center',
})
