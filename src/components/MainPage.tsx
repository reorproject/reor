import React, { useEffect, useState } from 'react'

import '../styles/global.css'
import ChatWrapper from './Chat/ChatWrapper'
import ResizableComponent from './Common/ResizableComponent'
import TitleBar from './TitleBar/TitleBar'
import EditorManager from './Editor/EditorManager'
import IconsSidebar from './Sidebars/IconsSidebar'
import SidebarManager, { SidebarAbleToShow } from './Sidebars/MainSidebar'
import SimilarFilesSidebarComponent from './Sidebars/SimilarFilesSidebar'
import EmptyPage from './Common/EmptyPage'
import { TabProvider } from '../providers/TabProvider'
import WritingAssistant from './WritingAssistant/WritingAssistant'
import useFileInfoTree from './Sidebars/FileSideBar/hooks/use-file-info-tree'
import { ChatProvider, useChatContext } from '@/providers/ChatContext'
import { FileProvider, useFileContext } from '@/providers/FileContext'

const UNINITIALIZED_STATE = 'UNINITIALIZED_STATE'

const MainPageContent: React.FC = () => {
  const [showSimilarFiles, setShowSimilarFiles] = useState(true)
  const [sidebarShowing, setSidebarShowing] = useState<SidebarAbleToShow>('files')
  const [currentTab, setCurrentTab] = useState<string>('')
  const [vaultDirectory, setVaultDirectory] = useState<string>('')
  const filePathRef = React.useRef<string>('')
  const chatIDRef = React.useRef<string>('')

  const {
    showChatbot,
    setShowChatbot,
    currentChatHistory,
    setCurrentChatHistory,
    setChatFilters,
    openChatSidebarAndChat,
    chatHistoriesMetadata,
  } = useChatContext()

  const { currentlyOpenFilePath, openOrCreateFile } = useFileContext()

  useEffect(() => {
    if (currentlyOpenFilePath != null && filePathRef.current !== currentlyOpenFilePath) {
      filePathRef.current = currentlyOpenFilePath
      setCurrentTab(currentlyOpenFilePath)
    }

    const currentChatHistoryId = currentChatHistory?.id ?? ''
    if (chatIDRef.current !== currentChatHistoryId) {
      chatIDRef.current = currentChatHistoryId
      const currentMetadata = chatHistoriesMetadata.find((chat) => chat.id === currentChatHistoryId)
      if (currentMetadata) {
        setCurrentTab(currentMetadata.displayName)
      }
    }
  }, [currentChatHistory, chatHistoriesMetadata, currentlyOpenFilePath])

  const { files, flattenedFiles, expandedDirectories, handleDirectoryToggle } = useFileInfoTree(currentlyOpenFilePath)

  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles)
  }

  const getChatIdFromPath = (path: string) => {
    if (chatHistoriesMetadata.length === 0) return UNINITIALIZED_STATE
    const metadata = chatHistoriesMetadata.find((chat) => chat.displayName === path)
    if (metadata) return metadata.id
    return ''
  }

  const openFileAndOpenEditor = async (path: string, optionalContentToWriteOnCreate?: string) => {
    setShowChatbot(false)
    setSidebarShowing('files')
    openOrCreateFile(path, optionalContentToWriteOnCreate)
  }

  const openTabContent = async (path: string) => {
    if (!path) return
    const chatID = getChatIdFromPath(path)
    if (chatID) {
      if (chatID === UNINITIALIZED_STATE) return
      const chat = await window.electronStore.getChatHistory(chatID)
      openChatSidebarAndChat(chat)
    } else {
      openFileAndOpenEditor(path)
    }
    setCurrentTab(path)
  }

  useEffect(() => {
    const setFileDirectory = async () => {
      const windowDirectory = await window.electronStore.getVaultDirectoryForWindow()
      setVaultDirectory(windowDirectory)
    }
    setFileDirectory()
  }, [])

  useEffect(() => {
    const handleAddFileToChatFilters = (file: string) => {
      setSidebarShowing('chats')
      setShowChatbot(true)
      setCurrentChatHistory(undefined)
      setChatFilters((prevChatFilters) => ({
        ...prevChatFilters,
        files: [...prevChatFilters.files, file],
      }))
    }
    const removeAddChatToFileListener = window.ipcRenderer.receive('add-file-to-chat-listener', (noteName: string) => {
      handleAddFileToChatFilters(noteName)
    })

    return () => {
      removeAddChatToFileListener()
    }
  }, [setCurrentChatHistory, setChatFilters, setShowChatbot])

  return (
    <div className="relative overflow-x-hidden">
      <div id="tooltip-container" />
      <TabProvider
        openTabContent={openTabContent}
        currentTab={currentTab}
        sidebarShowing={sidebarShowing}
        makeSidebarShow={setSidebarShowing}
        getChatIdFromPath={getChatIdFromPath}
      >
        <TitleBar
          currentTab={currentTab}
          openTabContent={openTabContent}
          similarFilesOpen={showSimilarFiles}
          toggleSimilarFiles={toggleSimilarFiles}
          openFileAndOpenEditor={openFileAndOpenEditor}
        />
      </TabProvider>

      <div className="flex h-below-titlebar">
        <div className="border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700 pt-2.5">
          <IconsSidebar
            openFileAndOpenEditor={openFileAndOpenEditor}
            sidebarShowing={sidebarShowing}
            makeSidebarShow={setSidebarShowing}
          />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="size-full border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700">
            <SidebarManager
              files={files}
              expandedDirectories={expandedDirectories}
              handleDirectoryToggle={handleDirectoryToggle}
              onFileSelect={openFileAndOpenEditor}
              sidebarShowing={sidebarShowing}
            />
          </div>
        </ResizableComponent>

        {!showChatbot && currentlyOpenFilePath ? (
          <div className="relative flex size-full overflow-hidden">
            <div className="h-full grow overflow-hidden">
              <EditorManager flattenedFiles={flattenedFiles} showSimilarFiles={showSimilarFiles} />
            </div>
            <WritingAssistant />
            {showSimilarFiles && (
              <div className="h-full shrink-0 overflow-y-auto overflow-x-hidden">
                <SimilarFilesSidebarComponent openFileAndOpenEditor={openFileAndOpenEditor} />
              </div>
            )}
          </div>
        ) : (
          !showChatbot && (
            <div className="relative flex size-full overflow-hidden">
              <EmptyPage openFileAndOpenEditor={openFileAndOpenEditor} />
            </div>
          )
        )}

        {showChatbot && (
          <div className="h-below-titlebar w-full">
            <ChatWrapper
              vaultDirectory={vaultDirectory}
              openFileAndOpenEditor={openFileAndOpenEditor}
              showSimilarFiles={showSimilarFiles}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const MainPageComponent: React.FC = () => {
  return (
    <ChatProvider>
      <FileProvider>
        <MainPageContent />
      </FileProvider>
    </ChatProvider>
  )
}

export default MainPageComponent
