import React, { useState } from 'react'

import '../styles/global.css'
import ChatComponent from './Chat'
import ResizableComponent from './Common/ResizableComponent'
import TitleBar from './TitleBar/TitleBar'
import EditorManager from './Editor/EditorManager'
import IconsSidebar from './Sidebars/IconsSidebar'
import SidebarManager from './Sidebars/MainSidebar'
import EmptyPage from './Common/EmptyPage'
import { ContentProvider } from '../contexts/ContentContext'
import WritingAssistant from './WritingAssistant/WritingAssistant'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import { FileProvider, useFileContext } from '@/contexts/FileContext'
import ModalProvider from '@/contexts/ModalContext'
import CommonModals from './Common/CommonModals'
import useAppShortcuts from './shortcuts/use-shortcut'

// Moved MainContent outside as a separate component
const MainContent: React.FC = () => {
  const { currentlyOpenFilePath } = useFileContext()

  return (
    <ResizableComponent resizeSide="right">
      <div className="relative flex size-full overflow-hidden">
        {currentlyOpenFilePath ? (
          <div className="h-full overflow-hidden">
            <EditorManager />
          </div>
        ) : (
          <EmptyPage />
        )}
        <WritingAssistant />
      </div>
    </ResizableComponent>
  )
}

const MainPageContent: React.FC = () => {
  const [showSimilarFiles, setShowSimilarFiles] = useState(false)
  const { currentlyOpenFilePath } = useFileContext()
  const { showChatbot } = useChatContext()
  const { getShortcutDescription } = useAppShortcuts()

  return (
    <div className="relative overflow-x-hidden">
      <TitleBar similarFilesOpen={showSimilarFiles} toggleSimilarFiles={() => setShowSimilarFiles(!showSimilarFiles)} />
      <div className="flex h-below-titlebar">
        <div className="border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700 pt-2.5">
          <IconsSidebar getShortcutDescription={getShortcutDescription} />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="size-full border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700">
            <SidebarManager />
          </div>
        </ResizableComponent>

        {/* Main content area with split screen support */}
        <div className="flex grow">
          {/* Editor section */}
          {(!showChatbot || currentlyOpenFilePath) && <MainContent />}

          {showChatbot && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <div className="w-full bg-pink-200">
              <div className="h-below-titlebar w-full">
                <ChatComponent />
              </div>
            </div>
          )}
        </div>

        <CommonModals />
      </div>
    </div>
  )
}

const MainPageComponent: React.FC = () => {
  return (
    <FileProvider>
      <ChatProvider>
        <ContentProvider>
          <ModalProvider>
            <MainPageContent />
          </ModalProvider>
        </ContentProvider>
      </ChatProvider>
    </FileProvider>
  )
}

export default MainPageComponent
