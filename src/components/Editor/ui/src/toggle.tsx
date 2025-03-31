import { Button, Stack, styled } from 'tamagui'

export const ToggleButton = styled(Button, {
  position: 'relative',
  height: 20,
  width: 36,
  alignItems: 'center',
  borderRadius: 1000,
  variants: {
    hybrid: {
      true: {
        backgroundColor: '$blue9',
        hoverStyle: {
          backgroundColor: '$blue10',
        },
      },
      false: {
        backgroundColor: '$gray4',
        hoverStyle: {
          backgroundColor: '$gray5',
        },
      },
    },
  } as const,
})

export const ToggleThumb = styled(Stack, {
  position: 'absolute',
  left: 2,
  width: 14,
  height: 14,
  borderRadius: 1000,
  backgroundColor: 'white',
  shadowColor: '$shadowColor',
  shadowRadius: 1,
  shadowOffset: { width: 0, height: 1 },
  transition: 'transform 0.3s',
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
