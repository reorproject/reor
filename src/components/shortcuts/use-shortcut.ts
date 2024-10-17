import { useCallback, useEffect, useRef } from 'react'
import { useModalOpeners } from '../../contexts/ModalContext'
import { useChatContext } from '../../contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'
import { shortcuts } from './shortcutDefinitions'

function useAppShortcuts() {
  const { setIsNewDirectoryModalOpen, setIsFlashcardModeOpen, setIsSettingsModalOpen } = useModalOpeners()
  const { setSidebarShowing } = useChatContext()
  const { createUntitledNote } = useContentContext()

  const handleShortcut = useCallback(
    (action: string) => {
      switch (action) {
        case 'open-new-note':
          createUntitledNote()
          break
        case 'open-new-directory-modal':
          setIsNewDirectoryModalOpen(true)
          break
        case 'open-search':
          setSidebarShowing('search')
          break
        case 'open-files':
          setSidebarShowing('files')
          break
        case 'open-chat-bot':
          setSidebarShowing('chats')
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
    [createUntitledNote, setIsNewDirectoryModalOpen, setSidebarShowing, setIsFlashcardModeOpen, setIsSettingsModalOpen],
  )

  const handleShortcutRef = useRef(handleShortcut)
  handleShortcutRef.current = handleShortcut
  // shortcuts.forEach(shortcut => {
  //   useHotkeys(shortcut.key, (event) => {
  //     event.preventDefault()
  //     handleShortcut(shortcut.action)
  //   }, {
  //     enableOnFormTags: true,
  //     preventDefault: true,
  //     enabled: true // Ensure the hotkey is always enabled
  //   }, [handleShortcut]) // Add handleShortcut to the dependency array
  // })
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

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
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