import { useEffect, useState, useCallback, useRef } from 'react'
import { shortcuts, Shortcut } from './shortcutDefinitions'
import { useModalOpeners } from '../../contexts/ModalContext'
import { useChatContext } from '../../contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'

function useShortcuts() {
  const { setIsNewDirectoryModalOpen, setIsFlashcardModeOpen, setIsSettingsModalOpen } = useModalOpeners()
  const { setSidebarShowing } = useChatContext()
  const { createUntitledNote } = useContentContext()
  const [shortcutMap, setShortcutMap] = useState<Record<string, string>>({})
  const listenersRef = useRef<(() => void)[]>([])

  const handleShortcut = useCallback(
    async (action: string) => {
      switch (action) {
        case 'open-new-note':
          await createUntitledNote()
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
          // Default do nothing
          break
      }
    },
    [setSidebarShowing, setIsNewDirectoryModalOpen, setIsSettingsModalOpen, setIsFlashcardModeOpen, createUntitledNote],
  )

  useEffect(() => {
    async function setupShortcuts() {
      const platform = await window.electronUtils.getPlatform()
      const map: Record<string, string> = {}

      shortcuts.forEach((shortcut: Shortcut) => {
        const displayValue = platform === 'darwin' ? shortcut.displayValue.mac : shortcut.displayValue.other
        map[shortcut.action] = `${shortcut.description} (${displayValue})`

        const handler = () => {
          handleShortcut(shortcut.action)
        }
        const removeListener = window.ipcRenderer.receive(shortcut.action, handler)
        listenersRef.current.push(removeListener)
      })

      setShortcutMap(map)
    }

    setupShortcuts()

    return () => {
      listenersRef.current.forEach((removeListener) => removeListener())
      listenersRef.current = []
    }
  }, [handleShortcut])

  const getShortcutDescription = useCallback(
    (action: string) => {
      return shortcutMap[action] || ''
    },
    [shortcutMap],
  )

  return { getShortcutDescription }
}

export default useShortcuts
