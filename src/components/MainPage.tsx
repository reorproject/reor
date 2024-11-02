import React, { useState } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

import '../styles/global.css'
import ChatComponent from './Chat'
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
    <div className="relative flex size-full overflow-hidden">
      {currentlyOpenFilePath ? (
        <div className="size-full overflow-hidden">
          <EditorManager />
        </div>
      ) : (
        <EmptyPage />
      )}
      <WritingAssistant />
    </div>
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

        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
            <div className="size-full border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700">
              <SidebarManager />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={showChatbot ? 50 : 80}>
            {(!showChatbot || currentlyOpenFilePath) && <MainContent />}
          </ResizablePanel>

          {showChatbot && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30}>
                <div className="w-full bg-pink-200">
                  <div className="h-below-titlebar w-full">
                    <ChatComponent />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

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
