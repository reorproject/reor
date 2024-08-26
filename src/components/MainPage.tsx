import React, { useEffect, useState } from 'react'

import posthog from 'posthog-js'

import '../styles/global.css'
import ChatWrapper from './Chat/ChatWrapper'
import { useChatHistory } from './Chat/hooks/use-chat-history'
import ResizableComponent from './Common/ResizableComponent'
import TitleBar from './Common/TitleBar'
import EditorManager from './Editor/EditorManager'
import useFileByFilepath from './File/hooks/use-file-by-filepath'
import IconsSidebar from './Sidebars/IconsSidebar'
import SidebarManager, { SidebarAbleToShow } from './Sidebars/MainSidebar'
import SimilarFilesSidebarComponent from './Sidebars/SimilarFilesSidebar'
import EmptyPage from './Common/EmptyPage'
import { TabProvider } from '../providers/TabProvider'
import { ModalProvider } from '../providers/ModalProvider'
import WritingAssistant from './WritingAssistant/WritingAssistant'
import { Chat, ChatFilters } from './Chat/types'
import useFileInfoTree from './Sidebars/FileSideBar/hooks/use-file-info-tree'
import CustomContextMenu, { ContextMenuLocations, ContextMenuFocus } from './Menu/CustomContextMenu'

const UNINITIALIZED_STATE = 'UNINITIALIZED_STATE'

const MainPageComponent: React.FC = () => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false)
  const [showSimilarFiles, setShowSimilarFiles] = useState(true)
  const [sidebarShowing, setSidebarShowing] = useState<SidebarAbleToShow>('files')
  const [currentTab, setCurrentTab] = useState<string>('')
  const [vaultDirectory, setVaultDirectory] = useState<string>('')
  const [chatFilters, setChatFilters] = useState<ChatFilters>({
    files: [],
    numberOfChunksToFetch: 15,
    minDate: new Date(0),
    maxDate: new Date(),
  })
  const [sidebarWidth, setSidebarWidth] = useState<number>(40)
  const [focusedItem,  setFocusedItem] = useState<ContextMenuFocus>({
    currentSelection: 'None',
    locations: { x: 0, y: 0 },
  })

  const filePathRef = React.useRef<string>('')
  const chatIDRef = React.useRef<string>('')

  const {
    filePath,
    setFilePath,
    editor,
    openOrCreateFile,
    saveCurrentlyOpenedFile,
    suggestionsState,
    highlightData,
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile,
    navigationHistory,
    setNavigationHistory,
  } = useFileByFilepath()

  const { currentChatHistory, setCurrentChatHistory, chatHistoriesMetadata } = useChatHistory()

  useEffect(() => {
    if (filePath != null && filePathRef.current !== filePath) {
      filePathRef.current = filePath
      setCurrentTab(filePath)
    }

    const currentChatHistoryId = currentChatHistory?.id ?? ''
    if (chatIDRef.current !== currentChatHistoryId) {
      chatIDRef.current = currentChatHistoryId
      const currentMetadata = chatHistoriesMetadata.find((chat) => chat.id === currentChatHistoryId)
      if (currentMetadata) {
        setCurrentTab(currentMetadata.displayName)
      }
    }
  }, [currentChatHistory, chatHistoriesMetadata, filePath])

  const { files, flattenedFiles, expandedDirectories, handleDirectoryToggle } = useFileInfoTree(filePath)

  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles)
  }

  const getChatIdFromPath = (path: string) => {
    if (chatHistoriesMetadata.length === 0) return UNINITIALIZED_STATE
    const metadata = chatHistoriesMetadata.find((chat) => chat.displayName === path)
    if (metadata) return metadata.id
    return ''
  }

  const openChatSidebarAndChat = (chatHistory: Chat | undefined) => {
    setShowChatbot(true)
    setSidebarShowing('chats')
    setCurrentChatHistory(chatHistory)
  }

  const openFileAndOpenEditor = async (path: string, optionalContentToWriteOnCreate?: string) => {
    setShowChatbot(false)
    setSidebarShowing('files')
    openOrCreateFile(path, optionalContentToWriteOnCreate)
  }

  const openTabContent = async (path: string) => {
    // generically opens a chat or a file
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

  // find all available files
  useEffect(() => {
    const updateWidth = async () => {
      const isCompact = await window.electronStore.getSBCompact()
      setSidebarWidth(isCompact ? 40 : 60)
    }

    // Listen for changes on settings
    const handleSettingsChange = (isCompact: number) => {
      setSidebarWidth(isCompact ? 40 : 60)
    }

    const setFileDirectory = async () => {
      const windowDirectory = await window.electronStore.getVaultDirectoryForWindow()
      setVaultDirectory(windowDirectory)
    }
    setFileDirectory()
    updateWidth()

    window.ipcRenderer.receive('sb-compact-changed', handleSettingsChange)
  }, [])

  useEffect(() => {
    const handleAddFileToChatFilters = (file: string) => {
      setSidebarShowing('chats')
      setShowChatbot(true)
      // setFileIsOpen(false);
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
  }, [setCurrentChatHistory, setChatFilters])

  const handleFocusedItem = (event: React.MouseEvent<HTMLDivElement>, focusedItem: ContextMenuLocations) => {
    event.preventDefault()

    setFocusedItem({
      currentSelection: focusedItem,
      locations: { x: event.clientX, y: event.clientY },
    })
  }

  return (
    <div className="relative overflow-x-hidden">
      {/* Displays the dropdown tab when hovering. You cannot use z-index and position absolute inside 
          TitleBar since one of the Parent components inadvertently creates a new stacking context that 
          impacts the z-index. */}
      <div id="tooltip-container" />
      <CustomContextMenu focusedItem={focusedItem} />
      <TabProvider
        openTabContent={openTabContent}
        currentTab={currentTab}
        setFilePath={setFilePath}
        setCurrentChatHistory={setCurrentChatHistory}
        sidebarShowing={sidebarShowing}
        makeSidebarShow={setSidebarShowing}
        getChatIdFromPath={getChatIdFromPath}
      >
        <TitleBar
          history={navigationHistory}
          setHistory={setNavigationHistory}
          currentTab={currentTab}
          openTabContent={openTabContent}
          similarFilesOpen={showSimilarFiles} // This might need to be managed differently now
          toggleSimilarFiles={toggleSimilarFiles} // This might need to be managed differently now
          openFileAndOpenEditor={openFileAndOpenEditor}
        />
      </TabProvider>

      <div className="flex h-below-titlebar">
        <div
          className="border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700 pt-2.5"
          style={{ width: `${sidebarWidth}px` }}
        >
          <ModalProvider>
            <IconsSidebar
              openFileAndOpenEditor={openFileAndOpenEditor}
              sidebarShowing={sidebarShowing}
              makeSidebarShow={setSidebarShowing}
              currentFilePath={filePath}
            />
          </ModalProvider>
        </div>

        <ResizableComponent resizeSide="right">
          <div className="size-full border-y-0 border-l-0 border-r-[0.001px] border-solid border-neutral-700">
            <SidebarManager
              files={files}
              expandedDirectories={expandedDirectories}
              handleDirectoryToggle={handleDirectoryToggle}
              selectedFilePath={filePath}
              onFileSelect={openFileAndOpenEditor}
              sidebarShowing={sidebarShowing}
              renameFile={renameFile}
              noteToBeRenamed={noteToBeRenamed}
              setNoteToBeRenamed={setNoteToBeRenamed}
              fileDirToBeRenamed={fileDirToBeRenamed}
              setFileDirToBeRenamed={setFileDirToBeRenamed}
              currentChatHistory={currentChatHistory}
              chatHistoriesMetadata={chatHistoriesMetadata}
              setCurrentChatHistory={openChatSidebarAndChat}
              setChatFilters={setChatFilters}
              setShowChatbot={setShowChatbot}
              handleFocusedItem={handleFocusedItem}
            />
          </div>
        </ResizableComponent>

        {!showChatbot && filePath ? (
          <div className="relative flex size-full overflow-hidden">
            <div className="h-full grow overflow-hidden">
              <EditorManager
                editor={editor}
                suggestionsState={suggestionsState}
                flattenedFiles={flattenedFiles}
                showSimilarFiles={showSimilarFiles}
              />{' '}
            </div>
            <WritingAssistant editor={editor} highlightData={highlightData} />
            {showSimilarFiles && (
              <div className="h-full shrink-0 overflow-y-auto overflow-x-hidden">
                <SimilarFilesSidebarComponent
                  filePath={filePath}
                  highlightData={highlightData}
                  openFileAndOpenEditor={openFileAndOpenEditor}
                  saveCurrentlyOpenedFile={saveCurrentlyOpenedFile}
                />
              </div>
            )}
          </div>
        ) : (
          !showChatbot && (
            <div className="relative flex size-full overflow-hidden">
              <ModalProvider>
                <EmptyPage openFileAndOpenEditor={openFileAndOpenEditor} />
              </ModalProvider>
            </div>
          )
        )}

        {showChatbot && (
          <div className="h-below-titlebar w-full">
            <ChatWrapper
              vaultDirectory={vaultDirectory}
              openFileAndOpenEditor={openFileAndOpenEditor}
              currentChatHistory={currentChatHistory}
              setCurrentChatHistory={setCurrentChatHistory}
              showSimilarFiles={showSimilarFiles} // This might need to be managed differently now
              chatFilters={chatFilters}
              setChatFilters={(updatedChatFilters: ChatFilters) => {
                posthog.capture('add_file_to_chat', {
                  chatFilesLength: updatedChatFilters.files.length,
                })
                setChatFilters(updatedChatFilters)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MainPageComponent
