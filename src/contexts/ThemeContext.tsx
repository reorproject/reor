import React, { createContext, useContext, useEffect, useState, PropsWithChildren, FC } from 'react'
import type { TamaguiThemeTypes } from 'electron/main/electron-store/storeConfig'
import { TamaguiProvider, useTheme } from 'tamagui'
import config from '../../tamagui.config'

interface ThemeActions {
  toggle: () => void
  set: (theme: TamaguiThemeTypes) => void
  syncWithSystem: () => void
}

export interface ThemeContextValue {
  state: TamaguiThemeTypes
  actions: ThemeActions
}

// Basic colors for manual Mantine Component
const styles = {
  '#f9f9f9': {
    mainColor: 'rgba(255, 255, 255, 1)',
    offsetMainColor: 'rgba(255, 255, 255, 0.6)',
    textColor: 'rgba(0, 0, 0, 1)',
    systemGray1: 'rgb(142, 142, 147)',
    systemGray2: 'rgb(174, 174, 178)',
    systemGray3: 'rgb(199, 199, 204)',
    systemGray4: 'rgb(209, 209, 214)',
    systemGray5: 'rgb(229, 229, 234)',
    systemGray6: 'rgb(242, 242, 247)',
    systemBlue: 'rgb(0, 122, 255)',
    systemBlueHover: 'rgba(10, 132, 255, 1)',
  },
  '#151515': {
    mainColor: 'rgba(0, 0, 0, 1)',
    offsetMainColor: 'rgba(0, 0, 0, 0.6)',
    textColor: 'rgba(255, 255, 255, 1)',
    systemGray1: 'rgb(142, 142, 147)',
    systemGray2: 'rgb(99, 99, 102)',
    systemGray3: 'rgb(72, 72, 74)',
    systemGray4: 'rgb(58, 58, 60)',
    systemGray5: 'rgb(44, 44, 46)',
    systemGray6: 'rgb(28, 28, 30)',
    systemBlue: 'rgb(10, 132, 255)',
    systemBlueHover: 'rgba(0, 122, 255, 1)',
  },
}

/**
 * Some mantine components look / act better then tamagui. This converts
 * tamagui styles to mantine styles.
 */
export const MantineStyleProps = () => {
  const theme = useTheme()

  const colors = styles[theme.background.val as keyof typeof styles]

  return {
    input: {
      backgroundColor: colors.mainColor,
      color: colors.textColor,
      '&:hover': {
        backgroundColor: colors.offsetMainColor,
      },
    },
    dropdown: {
      backgroundColor: colors.mainColor,
    },
    item: {
      color: colors.textColor,
      '&:hover': {
        backgroundColor: colors.systemBlue,
      },
    },
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export class ThemeManager {
  private state: TamaguiThemeTypes

  private setState: (theme: TamaguiThemeTypes) => void

  constructor(initialTheme: TamaguiThemeTypes, setState: (theme: TamaguiThemeTypes) => void) {
    this.state = initialTheme
    this.setState = setState
  }

  private async updateTheme(newTheme: TamaguiThemeTypes) {
    this.state = newTheme
    this.setState(newTheme)
    await window.electronStore.setTamaguiTheme(newTheme)
  }

  getContextValue(): ThemeContextValue {
    return {
      state: this.state,
      actions: {
        toggle: () => {
          const newTheme = this.state === 'light' ? 'dark' : 'light'
          this.updateTheme(newTheme)
        },
        set: (theme: TamaguiThemeTypes) => {
          this.updateTheme(theme)
        },
        syncWithSystem: () => {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          this.updateTheme(prefersDark ? 'dark' : 'light')
        },
      },
    }
  }
}

/**
 * Stores, gets, and updates the theme
 */
export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<TamaguiThemeTypes>('light')
  const [manager, setManager] = useState<ThemeManager | null>(null)

  useEffect(() => {
    const initTheme = async () => {
      const savedTheme = await window.electronStore.getTamaguiTheme()
      setTheme(savedTheme || 'light')
      setManager(new ThemeManager(savedTheme || 'light', setTheme))
    }

    initTheme()
  }, [])

  if (!manager) return null // Prevent rendering before the theme is set
  return (
    <ThemeContext.Provider value={manager.getContextValue()}>
      <TamaguiProvider config={config} defaultTheme={theme}>
        {children}
      </TamaguiProvider>
    </ThemeContext.Provider>
  )
}

// Custom hook for components to use
export const useThemeManager = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeManager must be used within ThemeProvider')
  return context
}
