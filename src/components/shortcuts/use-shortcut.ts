import { useCallback, useEffect, useRef } from 'react'
import { useModalOpeners } from '../../contexts/ModalContext'
import { useChatContext } from '../../contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'
import { shortcuts } from './shortcutDefinitions'
import debounce from './shortcutUtil'

function useAppShortcuts() {
  const { setIsFlashcardModeOpen, setIsSettingsModalOpen } = useModalOpeners()
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
        case 'open-flashcard-quiz-modal':
          setIsFlashcardModeOpen(true)
          break
        case 'open-settings-modal':
          setIsSettingsModalOpen(true)
          break
        default:
          // No other cases
          break
      }
    },
    [createUntitledNote, setSidebarShowing, setIsFlashcardModeOpen, setIsSettingsModalOpen, openNewChat],
  )

  const handleShortcutRef = useRef(handleShortcut)
  handleShortcutRef.current = handleShortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
    }

    const debouncedHandleKeyDown = debounce(handleKeyDown, 300) // 300ms debounce time

    window.addEventListener('keydown', debouncedHandleKeyDown)
    return () => {
      window.removeEventListener('keydown', debouncedHandleKeyDown)
    }
  }, [])

  const getShortcutDescription = useCallback((action: string) => {
    const shortcut = shortcuts.find((s) => s.action === action)
    if (!shortcut) return ''
    const platform = navigator.platform.toLowerCase().includes('mac') ? 'mac' : 'other'
    return `${shortcut.description} (${shortcut.displayValue[platform]})`
  }, [])

  return { getShortcutDescription }
}

export default useAppShortcuts
