import { Button, Stack, styled } from 'tamagui'

export const ToggleButton = styled(Button, {
  height: 20,
  width: 36,
  alignItems: 'center',
  borderRadius: 1000,
  focusStyle: {
    outlineStyle: 'none',
  },
  variants: {
    hybrid: {
      true: {
        backgroundColor: '$blue5',
      },
      false: {
        backgroundColor: '$gray6',
      },
    },
  } as const,
})

export const ToggleThumb = styled(Stack, {
  width: 14,
  height: 14,
  borderRadius: 1000,
  backgroundColor: '$white',
  shadowColor: '$shadowColor',
  shadowRadius: 1,
  shadowOffset: { width: 0, height: 1 },
  variants: {
    hybrid: {
      true: {
        transform: [{ translateX: 18 }],
      },
      false: {
        transform: [{ translateX: 2 }],
      },
    },
  } as const,
})