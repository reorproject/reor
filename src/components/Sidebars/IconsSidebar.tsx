import React, { useState } from 'react'

import { GrNewWindow } from 'react-icons/gr'
import { MdSettings } from 'react-icons/md'
import { VscNewFolder } from 'react-icons/vsc'
import { HiOutlinePencilAlt } from 'react-icons/hi'

import { Files, MessageCircle, Search, Moon, SunMoon } from '@tamagui/lucide-icons'
import { YStack } from 'tamagui'
import { useModalOpeners } from '../../contexts/ModalContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'
import { useThemeManager } from '@/contexts/ThemeContext'
import InitialSetupSinglePage from '../Settings/InitialSettingsSinglePage'

export interface IconsSidebarProps {
  getShortcutDescription: (action: string) => string
}

const IconsSidebar: React.FC<IconsSidebarProps> = ({ getShortcutDescription }) => {
  const { sidebarShowing, setSidebarShowing } = useChatContext()
  const [showVaultSetup, setShowVaultSetup] = useState(false)

  const { state, actions } = useThemeManager() // State => theme, actions => toggle, set, syncWithSystem
  const { isSettingsModalOpen, setIsSettingsModalOpen, setIsNewDirectoryModalOpen } = useModalOpeners()
  const { createUntitledNote } = useContentContext()

  const handleAllInitialSettingsAreReady = () => {
    setShowVaultSetup(false)
    window.database.indexFilesInDirectory()
  }

  const determineColor = (sidebarName: string) => {
    return sidebarShowing === sidebarName ? '$gray11' : '$gray9'
  }

  return (
    <YStack
      backgroundColor="$gray3"
      className="flex size-full w-[55px] flex-col items-center justify-between gap-1 bg-neutral-800 pt-2"
    >
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('files')}
      >
        <YStack
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          backgroundColor={sidebarShowing === 'files' ? '$gray6' : ''}
          className="flex size-4/5 items-center justify-center rounded"
        >
          <Files size={20} color={determineColor('files')} title={getShortcutDescription('open-files') || 'Files'} />
        </YStack>
      </div>
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('chats')}
      >
        <YStack
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          backgroundColor={sidebarShowing === 'chats' ? '$gray6' : ''}
          className="flex size-4/5 items-center justify-center rounded"
        >
          <MessageCircle
            size={20}
            color={determineColor('chats')}
            title={getShortcutDescription('open-chat-bot') || 'Open Chatbot'}
          />
        </YStack>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => setSidebarShowing('search')}
      >
        <YStack
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          backgroundColor={sidebarShowing === 'search' ? '$gray6' : ''}
          className="flex size-4/5 items-center justify-center rounded"
        >
          <Search
            size={20}
            color={determineColor('search')}
            title={getShortcutDescription('open-search') || 'Semantic Search'}
          />
        </YStack>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => createUntitledNote()}
      >
        <YStack
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          className="flex size-4/5 items-center justify-center rounded"
        >
          <HiOutlinePencilAlt
            className="text-gray-200"
            color="gray"
            size={22}
            title={getShortcutDescription('open-new-note') || 'New Note'}
          />
        </YStack>
      </div>
      <div
        className="mt-[2px] flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <YStack
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          className="flex size-4/5 items-center justify-center rounded"
        >
          <VscNewFolder
            className="text-gray-200"
            color="gray"
            size={18}
            title={getShortcutDescription('open-new-directory-modal') || 'New Directory'}
          />
        </YStack>
      </div>

      <div className="grow border-yellow-300" />
      <div className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent">
        <YStack
          alignItems="center"
          onPress={() => actions.toggle()}
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          className="flex size-4/5 items-center justify-center rounded"
        >
          {state === 'dark' ? (
            <SunMoon size={20} color="gray" title={getShortcutDescription('toggle-theme') || 'Toggle Theme'} />
          ) : (
            <Moon size={20} color="gray" title={getShortcutDescription('toggle-theme') || 'Toggle Theme'} />
          )}
        </YStack>
      </div>
      <div className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent">
        <YStack
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          className="flex size-4/5 items-center justify-center rounded"
          onClick={() => setShowVaultSetup(true)}
        >
          <GrNewWindow className="text-gray-100" color="gray" size={14} title="Open New Vault" />
        </YStack>
      </div>

      <div
        className="mb-[8px] flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
      >
        <YStack
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          className="flex size-4/5 items-center justify-center rounded"
        >
          <MdSettings color="gray" size={18} title={getShortcutDescription('open-settings-modal') || 'Settings'} />
        </YStack>
      </div>

      <div>
        {showVaultSetup && (
          <InitialSetupSinglePage
            readyForIndexing={handleAllInitialSettingsAreReady}
            onClose={() => setShowVaultSetup(false)}
          />
        )}
      </div>
    </YStack>
  )
}

export default IconsSidebar
