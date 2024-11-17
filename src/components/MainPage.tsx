/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
import React from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

import '../styles/global.css'
import ChatComponent from './Chat'
import TitleBar from './TitleBar/TitleBar'
import EditorManager from './Editor/EditorManager'
import IconsSidebar from './Sidebars/IconsSidebar'
import SidebarManager from './Sidebars/MainSidebar'
import EmptyPage from './Common/EmptyPage'
import { ContentProvider, useContentContext } from '../contexts/ContentContext'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import { FileProvider, useFileContext } from '@/contexts/FileContext'
import ModalProvider from '@/contexts/ModalContext'
import CommonModals from './Common/CommonModals'
import useAppShortcuts from '../lib/shortcuts/use-shortcut'
import WindowControls from './ui/window-controls'

// Moved MainContent outside as a separate component
const MainContent: React.FC = () => {
  const { currentlyOpenFilePath } = useFileContext()
  const { setShowChatbot } = useChatContext()
  const { showEditor, setShowEditor } = useContentContext()

  return (
    <div className="relative flex size-full overflow-hidden">
      {currentlyOpenFilePath && showEditor && (
        <div className="size-full overflow-hidden">
          <WindowControls
            onClose={() => setShowEditor(false)}
            onMaximize={() => {
              setShowChatbot(false)
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
  const { showChatbot, setShowChatbot, openNewChat } = useChatContext()
  const { setShowEditor, showEditor } = useContentContext()
  const { getShortcutDescription } = useAppShortcuts()

  const panelGroupKey = `${showChatbot}-${showEditor}-${!!currentlyOpenFilePath}`

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <TitleBar />
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

          <ResizablePanel defaultSize={80}>
            <div className="size-full">
              {currentlyOpenFilePath || showChatbot ? (
                <ResizablePanelGroup direction="horizontal" className="size-full" key={panelGroupKey}>
                  {currentlyOpenFilePath && showEditor && (
                    <>
                      <ResizablePanel defaultSize={65}>
                        <MainContent />
                      </ResizablePanel>
                      <ResizableHandle />
                    </>
                  )}
                  {showChatbot && (
                    <ResizablePanel defaultSize={currentlyOpenFilePath && showEditor ? 35 : 100}>
                      <div className="relative size-full bg-pink-200">
                        <WindowControls
                          onClose={() => setShowChatbot(false)}
                          onMaximize={() => setShowEditor(false)}
                          onNewChat={() => openNewChat()}
                        />
                        <ChatComponent />
                      </div>
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
