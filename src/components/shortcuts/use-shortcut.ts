import { useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useChatContext } from '../../contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'
import { shortcuts } from './shortcutDefinitions'

function useAppShortcuts() {
  const { setSidebarShowing, openNewChat } = useChatContext()
  const { createUntitledNote } = useContentContext()

  const handleShortcut = useCallback(
    (action: string) => {
      switch (action) {
        case 'open-new-note':
          createUntitledNote()
          break
        case 'open-new-directory-modal':
          window.dispatchEvent(new CustomEvent('open-new-directory-modal'))
          break
        case 'open-search':
          setSidebarShowing('search')
          break
        case 'open-files':
          setSidebarShowing('files')
          break
        case 'open-chat-bot':
          openNewChat()
          break
        default:
          // No other cases
          break
      }
    },
    [createUntitledNote, setSidebarShowing, openNewChat],
  )

  const handleShortcutRef = useRef(handleShortcut)
  handleShortcutRef.current = handleShortcut

  const debouncedHandleKeyDown = useDebouncedCallback((event: KeyboardEvent) => {
    const modifierPressed = event.ctrlKey || event.metaKey
    const keyPressed = event.key.toLowerCase()

    const triggeredShortcut = shortcuts.find((s) => {
      const [mod, key] = s.key.toLowerCase().split('+')
      return mod === 'mod' && modifierPressed && key === keyPressed
    })

    if (triggeredShortcut) {
      event.preventDefault()
      handleShortcutRef.current(triggeredShortcut.action)
    }
  }, 100)

  useEffect(() => {
    window.addEventListener('keydown', debouncedHandleKeyDown)
    return () => {
      window.removeEventListener('keydown', debouncedHandleKeyDown)
      debouncedHandleKeyDown.cancel()
    }
  }, [debouncedHandleKeyDown])

  const getShortcutDescription = useCallback((action: string) => {
    const shortcut = shortcuts.find((s) => s.action === action)
    if (!shortcut) return ''
    const platform = navigator.platform.toLowerCase().includes('mac') ? 'mac' : 'other'
    return `${shortcut.description} (${shortcut.displayValue[platform]})`
  }, [])

  return { getShortcutDescription }
}

export default useAppShortcuts
