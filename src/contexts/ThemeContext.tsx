import React, { createContext, useContext, useEffect, useState, PropsWithChildren, FC } from 'react'
import type { TamaguiThemeTypes } from 'electron/main/electron-store/storeConfig'
import { TamaguiProvider } from 'tamagui'
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
