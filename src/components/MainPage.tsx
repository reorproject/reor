/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
import React from 'react'
import { YStack } from 'tamagui'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

import '../styles/global.css'
import ChatComponent from './Chat'
import TitleBar from './TitleBar/TitleBar'
import EditorManager from './Editor/EditorManager'
import IconsSidebar from './Sidebars/IconsSidebar'
import SidebarManager from './Sidebars/MainSidebar'
import EmptyPage from './Common/EmptyPage'
import { ContentProvider, useContentContext } from '../contexts/ContentContext'
// import WritingAssistant from './WritingAssistant/WritingAssistant'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import { FileProvider, useFileContext } from '@/contexts/FileContext'
import ModalProvider from '@/contexts/ModalContext'
import CommonModals from './Common/CommonModals'
import useAppShortcuts from '../lib/shortcuts/use-shortcut'
import WindowControls from './ui/window-controls'
import SimilarFilesSidebarComponent from '@/components/Sidebars/SimilarFilesSidebar'

interface MainContentProps {
  togglePanel: (panel: 'chat' | 'similarFiles' | null) => void
}

// Moved MainContent outside as a separate component
const MainContent: React.FC<MainContentProps> = ({ togglePanel }) => {
  const { currentlyOpenFilePath } = useFileContext()
  const { showEditor, setShowEditor } = useContentContext()

  return (
    <div className="relative flex size-full overflow-hidden">
      {currentlyOpenFilePath && showEditor && (
        <div className="size-full overflow-hidden">
          <WindowControls
            onClose={() => setShowEditor(false)}
            onMaximize={() => {
              togglePanel('chat')
            }}
          />
          <EditorManager />
        </div>
      )}
    </div>
  )
}

const MainPageContent: React.FC = () => {
  const { currentlyOpenFilePath } = useFileContext()
  const { setShowEditor, showEditor } = useContentContext()
  const { getShortcutDescription } = useAppShortcuts()
  const { activePanel, setActivePanel, openNewChat } = useChatContext()

  const togglePanel = (panel: 'chat' | 'similarFiles' | null) => {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }

  const panelSizes = {
    mainContent: 65,
    chatComponent: 35,
    similarFilesSidebar: 30,
  }

  return (
    <YStack className="relative flex h-screen flex-col overflow-hidden">
      <TitleBar activePanel={activePanel} togglePanel={togglePanel} />
      <div className="flex min-h-0 flex-1">
        <div className="border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700">
          <IconsSidebar getShortcutDescription={getShortcutDescription} />
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
            <div className="size-full border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700">
              <SidebarManager />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel>
            <div className="size-full">
              {currentlyOpenFilePath || activePanel ? (
                <ResizablePanelGroup direction="horizontal" className="size-full">
                  {currentlyOpenFilePath && showEditor && (
                    <>
                      <ResizablePanel defaultSize={panelSizes.mainContent}>
                        <MainContent togglePanel={togglePanel} />
                      </ResizablePanel>
                      <ResizableHandle />
                    </>
                  )}
                  {activePanel === 'chat' && (
                    <ResizablePanel defaultSize={panelSizes.chatComponent}>
                      <div className="relative size-full ">
                        <WindowControls
                          onClose={() => setActivePanel(null)}
                          onMaximize={() => setShowEditor(false)}
                          onNewChat={() => openNewChat()}
                        />
                        <ChatComponent />
                      </div>
                    </ResizablePanel>
                  )}
                  {activePanel === 'similarFiles' && (
                    <ResizablePanel defaultSize={panelSizes.similarFilesSidebar}>
                      <SimilarFilesSidebarComponent />
                    </ResizablePanel>
                  )}
                </ResizablePanelGroup>
              ) : (
                <EmptyPage />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <CommonModals />
      </div>
    </YStack>
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
