import React, { useEffect, useRef, useState } from 'react'

import posthog from 'posthog-js'
import { IoMdArrowRoundBack, IoMdArrowRoundForward } from 'react-icons/io'

import { removeFileExtension } from '@/lib/strings'
import '../../styles/history.scss'
import { useFileContext } from '@/contexts/FileContext'
import { useWindowContentContext } from '@/contexts/WindowContentContext'

const FileHistoryNavigator: React.FC = () => {
  const [showMenu, setShowMenu] = useState<string>('')
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const buttonRefBack = useRef<HTMLButtonElement>(null)
  const buttonRefForward = useRef<HTMLButtonElement>(null)

  const { openContent, currentOpenFileOrChatID } = useWindowContentContext()
  const { navigationHistory } = useFileContext()

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowMenu('')
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })

  if (!currentOpenFileOrChatID) {
    return null
  }

  const canGoBack = navigationHistory.length > 1
  const indexOfCurrentOpenFileOrChat = navigationHistory.indexOf(currentOpenFileOrChatID)
  const canGoForward = indexOfCurrentOpenFileOrChat < navigationHistory.length - 1

  const goBack = () => {
    if (canGoBack && showMenu === '') {
      const newIndex = indexOfCurrentOpenFileOrChat - 1
      openContent(navigationHistory[newIndex], undefined, true)
      posthog.capture('file_history_navigator_back')
    }
  }

  const goForward = () => {
    if (canGoForward && showMenu === '') {
      const newIndex = indexOfCurrentOpenFileOrChat + 1
      openContent(navigationHistory[newIndex], undefined, true)
      posthog.capture('file_history_navigator_forward')
    }
  }

  const goSelected = (pathOrChatID: string): void => {
    if (pathOrChatID) {
      openContent(pathOrChatID, undefined, true)
      posthog.capture('file_history_navigator_go_to_selected_file')
    }
    setShowMenu('')
  }

  const handleLongPressStart = (direction: 'back' | 'forward') => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(direction)
    }, 400)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleHistoryContext = (currentRef: React.RefObject<HTMLButtonElement>) => {
    const offsetTop = currentRef.current?.offsetTop || 0
    const offsetLeft = currentRef.current?.offsetLeft || 0
    const offsetHeight = currentRef.current?.offsetHeight || 0

    const menuChild =
      currentRef.current?.id === 'back'
        ? navigationHistory.slice(0, indexOfCurrentOpenFileOrChat)
        : navigationHistory.slice(indexOfCurrentOpenFileOrChat + 1)

    return (
      showMenu !== '' &&
      menuChild.length > 0 && (
        <div
          ref={ref}
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className="history-menu"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          style={{
            left: `${offsetLeft}px`,
            top: `${offsetTop + offsetHeight}px`,
          }}
        >
          <ul>
            {menuChild.map((pathOrChatID) => (
              <li key={pathOrChatID}>
                <div key={pathOrChatID} onClick={() => goSelected(pathOrChatID)}>
                  {removeFileExtension(pathOrChatID.replace(/\\/g, '/').split('/').pop() || '')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
    )
  }

  return (
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div className="history-container flex">
      <button
        id="back"
        ref={buttonRefBack}
        onMouseDown={() => handleLongPressStart('back')}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={goBack}
        disabled={!canGoBack}
        style={{
          color: !canGoBack ? '#727272' : '#dedede',
          cursor: !canGoBack ? 'default' : 'pointer',
        }}
        title="Back"
        type="button"
        aria-label="Back"
      >
        <IoMdArrowRoundBack title="Back" />
      </button>
      <button
        id="forward"
        ref={buttonRefForward}
        onMouseDown={() => handleLongPressStart('forward')}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={goForward}
        disabled={!canGoForward}
        style={{
          color: !canGoForward ? '#727272' : '#dedede',
          cursor: !canGoForward ? 'default' : 'pointer',
        }}
        title="Forward"
        type="button"
        aria-label="Forward"
      >
        <IoMdArrowRoundForward title="Forward" />
      </button>
      {handleHistoryContext(showMenu === 'back' ? buttonRefBack : buttonRefForward)}
    </div>
  )
}

export default FileHistoryNavigator
