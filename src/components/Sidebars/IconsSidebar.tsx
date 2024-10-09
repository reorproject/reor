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
import { useWindowContentContext } from '@/contexts/WindowContentContext'

const IconsSidebar: React.FC = () => {
  const { sidebarShowing, setSidebarShowing } = useChatContext()
  const [sidebarWidth, setSidebarWidth] = useState<number>(40)

  const { setIsNewDirectoryModalOpen, isSettingsModalOpen, setIsSettingsModalOpen, setIsFlashcardModeOpen } =
    useModalOpeners()
  const { createUntitledNote } = useWindowContentContext()

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
            title="Files"
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
            title={sidebarShowing === 'chats' ? 'Close Chatbot' : 'Open Chatbot'}
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
            title="Semantic Search"
          />
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={createUntitledNote}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <HiOutlinePencilAlt className="text-gray-200" color="gray" size={22} title="New Note" />
        </div>
      </div>
      <div
        className="mt-[2px] flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <VscNewFolder className="text-gray-200" color="gray" size={18} title="New Directory" />
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsFlashcardModeOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <MdOutlineQuiz className="text-gray-200" color="gray" size={19} title="Flashcard quiz" />
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
        <MdSettings color="gray" size={18} className="mb-3 size-6 text-gray-100" title="Settings" />
      </button>
    </div>
  )
}

export default IconsSidebar
