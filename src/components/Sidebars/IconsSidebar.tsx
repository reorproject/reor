import React, { useEffect, useState } from 'react'

import { FaSearch } from 'react-icons/fa'
import { GrNewWindow } from 'react-icons/gr'
import { ImFilesEmpty } from 'react-icons/im'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import { MdOutlineQuiz, MdSettings } from 'react-icons/md'
import { VscNewFolder } from 'react-icons/vsc'
import { HiOutlinePencilAlt } from 'react-icons/hi'

import { useModalOpeners } from '../../contexts/ModalContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'
import NewDirectoryComponent from '../File/NewDirectory'
import { IconsSidebarProps } from './IconsSidebarTypes'

const IconsSidebar: React.FC<IconsSidebarProps> = ({
  getShortcutDescription,
  isNewDirectoryModalOpen,
  setIsNewDirectoryModalOpen,
}) => {
  const { sidebarShowing, setSidebarShowing } = useChatContext()
  const [sidebarWidth, setSidebarWidth] = useState<number>(40)

  const { isSettingsModalOpen, setIsSettingsModalOpen, setIsFlashcardModeOpen } = useModalOpeners()
  const { createUntitledNote } = useContentContext()

  useEffect(() => {
    const updateWidth = async () => {
      const isCompact = await window.electronStore.getSBCompact()
      setSidebarWidth(isCompact ? 40 : 60)
    }

    const handleSettingsChange = (isCompact: number) => {
      setSidebarWidth(isCompact ? 40 : 60)
    }

    updateWidth()

    window.ipcRenderer.receive('sb-compact-changed', handleSettingsChange)
  }, [])

  return (
    <div
      className="flex size-full flex-col items-center justify-between gap-1 bg-neutral-800"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('files')}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <ImFilesEmpty
            className="mx-auto text-gray-200"
            color={sidebarShowing === 'files' ? 'white' : 'gray'}
            size={18}
            title={getShortcutDescription('open-files') || 'Open Files'}
          />
        </div>
      </div>
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('chats')}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <IoChatbubbleEllipsesOutline
            color={sidebarShowing === 'chats' ? 'white' : 'gray'}
            className="cursor-pointer text-gray-100 "
            size={18}
            title={getShortcutDescription('open-chat-bot') || 'Open Chatbot'}
          />
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('search')}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <FaSearch
            color={sidebarShowing === 'search' ? 'white' : 'gray'}
            size={18}
            className="text-gray-200"
            title={getShortcutDescription('open-search') || 'Semantic Search'}
          />
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => createUntitledNote()}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <HiOutlinePencilAlt
            className="text-gray-200"
            color="gray"
            size={22}
            title={getShortcutDescription('open-new-note') || 'New Note'}
          />
        </div>
      </div>
      <div
        className="mt-[2px] flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <VscNewFolder
            className="text-gray-200"
            color="gray"
            size={18}
            title={getShortcutDescription('open-new-directory-modal') || 'New Directory'}
          />
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsFlashcardModeOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <MdOutlineQuiz
            className="text-gray-200"
            color="gray"
            size={19}
            title={getShortcutDescription('open-flashcard-quiz-modal') || 'Flashcard quiz'}
          />
        </div>
      </div>

      <div className="grow border-yellow-300" />
      <div
        className="mb-[2px] flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => window.electronUtils.openNewWindow()}
      >
        <GrNewWindow className="text-gray-100" color="gray" size={18} title="Open New Vault" />
      </div>
      <button
        className="flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
        type="button"
        aria-label="Open Settings"
      >
        <MdSettings
          color="gray"
          size={18}
          className="mb-3 size-6 text-gray-100"
          title={getShortcutDescription('open-settings-modal') || 'Settings'}
        />
      </button>
      <NewDirectoryComponent isOpen={isNewDirectoryModalOpen} onClose={() => setIsNewDirectoryModalOpen(false)} />
    </div>
  )
}

export default IconsSidebar
