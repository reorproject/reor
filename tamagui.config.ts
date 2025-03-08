import config from '@/components/Editor/ui/src/tamagui/tamagui.config'

type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}

  interface TypeOverride {
    groupNames(): 'header' | 'item' | 'blocknode' | 'pathitem' | 'icon'
  }

  export interface ThemeNameOverrides {
    fileSidebar: true
  }
}

export default config
