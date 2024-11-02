/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react'
import { X, Maximize2 } from 'lucide-react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

import '../styles/global.css'
import ChatComponent from './Chat'
import TitleBar from './TitleBar/TitleBar'
import EditorManager from './Editor/EditorManager'
import IconsSidebar from './Sidebars/IconsSidebar'
import SidebarManager from './Sidebars/MainSidebar'
import EmptyPage from './Common/EmptyPage'
import { ContentProvider, useContentContext } from '../contexts/ContentContext'
import WritingAssistant from './WritingAssistant/WritingAssistant'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import { FileProvider, useFileContext } from '@/contexts/FileContext'
import ModalProvider from '@/contexts/ModalContext'
import CommonModals from './Common/CommonModals'
import useAppShortcuts from './shortcuts/use-shortcut'

const WindowControls: React.FC<{
  onClose: () => void
  onMaximize: () => void
}> = ({ onClose, onMaximize }) => (
  <div className="absolute right-2 top-2 z-10 flex gap-2">
    <button onClick={onMaximize} className="rounded p-1 transition-colors hover:bg-neutral-700/50" title="Maximize">
      <Maximize2 className="size-4 text-neutral-400" />
    </button>
    <button onClick={onClose} className="rounded p-1 transition-colors hover:bg-neutral-700/50" title="Close">
      <X className="size-4 text-neutral-400" />
    </button>
  </div>
)

// Moved MainContent outside as a separate component
const MainContent: React.FC = () => {
  const { currentlyOpenFilePath } = useFileContext()
  const { setShowChatbot } = useChatContext()
  const { showEditor, setShowEditor } = useContentContext()

  return (
    <div className="relative flex size-full overflow-hidden">
      {currentlyOpenFilePath && showEditor ? (
        <div className="size-full overflow-hidden">
          <WindowControls
            onClose={() => setShowEditor(false)}
            onMaximize={() => {
              setShowChatbot(false)
            }}
          />
          <EditorManager />
        </div>
      ) : (
        // <EmptyPage />
        <></>
      )}
      <WritingAssistant />
    </div>
  )
}

const MainPageContent: React.FC = () => {
  const [showSimilarFiles, setShowSimilarFiles] = useState(false)
  const { currentlyOpenFilePath } = useFileContext()
  const { showChatbot, setShowChatbot } = useChatContext()
  const { setShowEditor } = useContentContext()
  const { getShortcutDescription } = useAppShortcuts()

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <TitleBar similarFilesOpen={showSimilarFiles} toggleSimilarFiles={() => setShowSimilarFiles(!showSimilarFiles)} />
      <div className="flex min-h-0 flex-1">
        <div className="border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700 pt-2.5">
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
              {currentlyOpenFilePath ? (
                <>
                  {showChatbot ? (
                    <ResizablePanelGroup direction="horizontal" className="size-full">
                      <ResizablePanel defaultSize={65}>
                        <MainContent />
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={35}>
                        <div className="relative size-full bg-pink-200">
                          <WindowControls
                            onClose={() => {
                              setShowChatbot(false)
                            }}
                            onMaximize={() => {
                              setShowEditor(false)
                            }}
                          />
                          <ChatComponent />
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  ) : (
                    <MainContent />
                  )}
                </>
              ) : showChatbot ? (
                <div className="size-full bg-pink-200">
                  <ChatComponent />
                </div>
              ) : (
                <div className="size-full">
                  <EmptyPage />
                </div>
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
