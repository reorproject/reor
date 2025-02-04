import { styled } from '@tamagui/core'
import { Heading as THeading } from '@tamagui/text'

export const SeedHeading = styled(THeading, {
  fontWeight: 'bold',
  fontSize: '$5',
  lineHeight: '$5',
  defaultVariants: {
    level: 2,
  },
  variants: {
    level: {
      1: {
        tag: 'h1',
        fontSize: '$8',
        lineHeight: '$8',
        $gtMd: {
          fontSize: '$9',
          lineHeight: '$9',
        },
      },
      2: {
        tag: 'h2',
        fontSize: '$7',
        lineHeight: '$7',
        $gtMd: {
          fontSize: '$8',
          lineHeight: '$8',
        },
        $gtLg: {
          fontSize: '$9',
          lineHeight: '$9',
        },
      },
      3: {
        tag: 'h3',
        fontSize: '$6',
        lineHeight: '$6',
        $gtMd: {
          fontSize: '$7',
          lineHeight: '$7',
        },
        $gtLg: {
          fontSize: '$8',
          lineHeight: '$8',
        },
      },
      4: {
        tag: 'h4',
        fontSize: '$5',
        lineHeight: '$5',
        $gtMd: {
          fontSize: '$6',
          lineHeight: '$6',
        },
        $gtLg: {
          fontSize: '$7',
          lineHeight: '$7',
        },
      },
    },
  },
})
