import { styled, Input, View, Text } from 'tamagui'

export const StyledInput = styled(Input, {
  name: 'StyledInput',
  flex: 1,
  backgroundColor: 'transparent',
  padding: '$1',
  pr: '$4',
  color: '$white',
  outlineWidth: 0,
})

export const StyledResultCount = styled(Text, {
  name: 'StyledResultCount',
  position: 'absolute',
  right: '$2',
  top: '50%',
  transform: [{ translateY: -'50%' }],
  fontSize: '$2',
  color: '$white',
})

export const StyledDivider = styled(View, {
  name: 'StyledDivider',
  mx: '$2',
  height: '$4',
  width: 1,
  backgroundColor: '$gray700', // Adjusted for Tamagui colors
})
