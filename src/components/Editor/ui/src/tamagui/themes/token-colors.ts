import { Variable } from '@tamagui/web'

import {
  blue,
  blueDark,
  brand,
  brandDark,
  customGray,
  customGrayDark,
  green,
  greenDark,
  // orange,
  // orangeDark,
  // pink,
  // pinkDark,
  purple,
  purpleDark,
  red,
  redDark,
  yellow,
  yellowDark,
  whiteA,
  blackA,
} from './colors'

export {
  darkColor,
  darkPalette,
  darkTransparent,
  lightColor,
  lightPalette,
  lightTransparent,
  customGrayDark,
} from './colors'

export const colorTokens = {
  light: {
    blue,
    customGray,
    green,
    // orange,
    // pink,
    purple,
    red,
    yellow,
    brand,
    brandDark,
    whiteA,
  },
  dark: {
    blue: blueDark,
    gray: customGrayDark,
    green: greenDark,
    // orange: orangeDark,
    // pink: pinkDark,
    purple: purpleDark,
    red: redDark,
    yellow: yellowDark,
    brand: brandDark,
    whiteA: blackA,
  },
}

export const darkColors = {
  ...colorTokens.dark.blue,
  ...colorTokens.dark.gray,
  ...colorTokens.dark.green,
  // ...colorTokens.dark.orange,
  // ...colorTokens.dark.pink,
  ...colorTokens.dark.purple,
  ...colorTokens.dark.red,
  ...colorTokens.dark.yellow,
  ...colorTokens.dark.brand,
}

export const lightColors = {
  ...colorTokens.light.blue,
  ...colorTokens.light.customGray,
  ...colorTokens.light.green,
  // ...colorTokens.light.orange,
  // ...colorTokens.light.pink,
  ...colorTokens.light.purple,
  ...colorTokens.light.red,
  ...colorTokens.light.yellow,
  ...colorTokens.light.brand,
}

export const color = {
  ...postfixObjKeys(lightColors, 'Light'),
  ...postfixObjKeys(darkColors, 'Dark'),
}

function postfixObjKeys<A extends { [key: string]: Variable<string> | string }, B extends string>(
  obj: A,
  postfix: B,
): {
  [Key in `${keyof A extends string ? keyof A : never}${B}`]: Variable<string> | string
} {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [`${k}${postfix}`, v])) as never
}
