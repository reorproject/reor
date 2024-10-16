// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow } from 'electron'
import { shortcuts } from './shortcutDefinitions'

function isShortcutMatch(input: Electron.Input, shortcutKey: string): boolean {
  const keys = shortcutKey.split('+')
  const mainKey = keys.pop()?.toLowerCase()

  if (!mainKey) {
    return false
  }

  const modifiers = {
    control: keys.includes('Control') || keys.includes('CommandOrControl'),
    alt: keys.includes('Alt'),
    shift: keys.includes('Shift'),
    meta: keys.includes('Meta') || keys.includes('CommandOrControl'),
  }

  return (
    input.key.toLowerCase() === mainKey &&
    input.control === (modifiers.control || modifiers.meta) &&
    input.alt === modifiers.alt &&
    input.shift === modifiers.shift &&
    (input.meta === modifiers.meta || input.control === modifiers.meta)
  )
}

export function registerShortcuts(mainWindow: BrowserWindow) {
  mainWindow.webContents.on('before-input-event', (event, input) => {
    shortcuts.forEach((shortcut) => {
      if (input.type === 'keyDown' && isShortcutMatch(input, shortcut.key)) {
        event.preventDefault()
        mainWindow.webContents.send(shortcut.action)
      }
    })
  })
}

export function unregisterShortcuts(mainWindow: BrowserWindow) {
  mainWindow.webContents.removeAllListeners('before-input-event')
}
