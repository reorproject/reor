import React, { useState } from 'react'

import '../styles/global.css'
import ChatComponent from './Chat'
import ResizableComponent from './Common/ResizableComponent'
import TitleBar from './TitleBar/TitleBar'
import EditorManager from './Editor/EditorManager'
import IconsSidebar from './Sidebars/IconsSidebar'
import SidebarManager from './Sidebars/MainSidebar'
import SimilarFilesSidebarComponent from './Sidebars/SimilarFilesSidebar'
import EmptyPage from './Common/EmptyPage'
import { TabProvider } from '../contexts/TabContext'
import WritingAssistant from './WritingAssistant/WritingAssistant'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import { FileProvider, useFileContext } from '@/contexts/FileContext'
import ModalProvider from '@/contexts/ModalContext'

const MainPageContent: React.FC = () => {
  const [showSimilarFiles, setShowSimilarFiles] = useState(true)

  const { currentlyOpenFilePath } = useFileContext()

  const { showChatbot } = useChatContext()

  return (
    <div className="relative overflow-x-hidden">
      <div id="tooltip-container" />
      <TitleBar
        similarFilesOpen={showSimilarFiles}
        toggleSimilarFiles={() => {
          setShowSimilarFiles(!showSimilarFiles)
        }}
      />

      <div className="flex h-below-titlebar">
        <div className="border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700 pt-2.5">
          <IconsSidebar />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="size-full border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700">
            <SidebarManager />
          </div>
        </ResizableComponent>

        {!showChatbot && currentlyOpenFilePath ? (
          <div className="relative flex size-full overflow-hidden">
            <div className="h-full grow overflow-hidden">
              <EditorManager />
            </div>
            <WritingAssistant />
            {showSimilarFiles && (
              <div className="h-full shrink-0 overflow-y-auto overflow-x-hidden">
                <SimilarFilesSidebarComponent />
              </div>
            )}
          </div>
        ) : (
          !showChatbot && (
            <div className="relative flex size-full overflow-hidden">
              <EmptyPage />
            </div>
          )
        )}

        {showChatbot && (
          <div className="h-below-titlebar w-full">
            <ChatComponent showSimilarFiles={showSimilarFiles} />
          </div>
        )}
      </div>
    </div>
  )
}

const MainPageComponent: React.FC = () => {
  return (
    <FileProvider>
      <ChatProvider>
        <TabProvider>
          <ModalProvider>
            <MainPageContent />
          </ModalProvider>
        </TabProvider>
      </ChatProvider>
    </FileProvider>
  )
}

export default MainPageComponent
