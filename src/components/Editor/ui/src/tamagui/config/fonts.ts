import { createInterFont } from '@tamagui/font-inter'
import { createGenericFont } from './create-generic-font'

export const headingFont = createInterFont(
  {
    size: {
      1: 36,
      2: 30,
      3: 24,
      4: 22,
      5: 20,
      6: 18,
      true: 30,
    },
    weight: {
      1: '700',
      2: '500',
      3: '400',
      4: '200',
    },
    face: {
      700: { normal: 'InterBold' },
      500: { normal: 'InterBold' },
      400: { normal: 'InterBold' },
      200: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => size,
    sizeLineHeight: (fontSize) => fontSize * 1.25,
  },
)

export const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => size + 5,
  },
)

export const monoFont = createGenericFont(
  `"ui-monospace", "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace`,
  {
    weight: {
      1: '500',
    },
    size: {
      1: 11,
      2: 12,
      3: 13,
      4: 14,
      5: 16,
      6: 18,
      7: 20,
      8: 22,
      9: 30,
      10: 42,
      11: 52,
      12: 62,
      13: 72,
      14: 92,
      15: 114,
      16: 124,
    },
  },
  {
    sizeLineHeight: (x) => x * 1.5,
  },
)

export const _editorBody = createInterFont({
  weight: {
    1: '500',
  },
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 22,
    7: 28,
    8: 32,
    9: 40,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 124,
  },
})

export const editorBody = createGenericFont(
  `Georgia, Times, "Times New Roman", serif`,
  {
    weight: {
      1: '500',
    },
    size: {
      1: 12,
      2: 14,
      3: 16,
      4: 18,
      5: 20,
      6: 22,
      7: 28,
      8: 32,
      9: 40,
      10: 42,
      11: 52,
      12: 62,
      13: 72,
      14: 92,
      15: 114,
      16: 124,
    },
  },
  {
    sizeLineHeight: (x) => x * 1.5,
  },
)
