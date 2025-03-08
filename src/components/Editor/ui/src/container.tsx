import React, { ComponentProps } from 'react'
import { styled } from '@tamagui/core'
import { XStack, YStack } from '@tamagui/stacks'

const variants = {
  hide: {
    true: {
      pointerEvents: 'none',
      opacity: 0,
    },
  },
  clearVerticalSpace: {
    true: {
      paddingVertical: 0,
    },
  },
  centered: {
    true: {
      maxWidth: 'calc(85ch + 1em)',
    },
  },
} as const

export const PageContainer = ({ children, ...props }: ComponentProps<typeof YStack>) => {
  return (
    <XStack jc="center" f={1}>
      <YStack f={1} paddingHorizontal="$4" alignSelf="center" {...props}>
        {children}
      </YStack>
    </XStack>
  )
}

export const ContainerDefault = styled(YStack, {
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',
  paddingVertical: '$6',
  width: '100%',
  $gtSm: {
    maxWidth: 700,
    paddingRight: '$2',
  },

  $gtMd: {
    maxWidth: 740,
    paddingRight: '$2',
  },

  $gtLg: {
    maxWidth: 800,
    paddingRight: '$10',
  },

  variants,
})

export const ContainerLarge = styled(YStack, {
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',
  paddingTop: '$6',
  width: '100%',
  // maxWidth: "calc(85ch + 1em)",
  flexShrink: 'unset',
  variants,
})

export const ContainerXL = styled(YStack, {
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',
  paddingVertical: '$6',
  width: '100%',
  $gtSm: {
    maxWidth: 980,
  },

  $gtMd: {
    maxWidth: 1240,
  },

  $gtLg: {
    maxWidth: 1440,
  },

  variants,
})

export const AppContainer = ContainerLarge
export const Container = ContainerLarge
