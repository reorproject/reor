import { createTamagui } from '@tamagui/core'
import { shorthands } from '@tamagui/shorthands'
import { createTokens } from '@tamagui/web'
import animations from './config/animations'
import { bodyFont, editorBody, headingFont, monoFont } from './config/fonts'
import { media, mediaQueryDefaultActive } from './config/media'
import radius from './themes/token-radius'
import { size } from './themes/token-size'
import space from './themes/token-space'
import zIndex from './themes/token-z-index'

import * as themes from './themes/themes-generated'
import { color } from './themes/token-colors'

const conf = {
  themes: themes.themes,
  defaultFont: 'body',
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
    mono: monoFont,
    editorBody: editorBody,
  },
  tokens: createTokens({
    color,
    radius,
    zIndex,
    space,
    size,
    opacity: {
      low: 0.4,
      medium: 0.6,
      high: 0.8,
      full: 1.0,
    },
  }),
  media,
  settings: {
    webContainerType: 'inherit',
  },
} satisfies Parameters<typeof createTamagui>['0']

// @ts-ignore
conf.mediaQueryDefaultActive = mediaQueryDefaultActive
const config = createTamagui(conf)

export default config
