import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react'

import { UNINITIALIZED_STATE, useChatContext } from './ChatContext'
import { useFileContext } from './FileContext'

interface TabContextType {
  openTabContent: (pathOrChatID: string, optionalContentToWriteOnCreate?: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export const useTabsContext = (): TabContextType => {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider')
  }
  return context
}

interface TabProviderProps {
  children: ReactNode
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  // const [currentTabID, setCurrentTabID] = useState<string>('')
  // const [openTabs, setOpenTabs] = useState<Tab[]>([])
  const { currentOpenChat, setCurrentOpenChat, allChatsMetadata, setShowChatbot, setSidebarShowing } = useChatContext()
  const { currentlyOpenFilePath, openOrCreateFile } = useFileContext()

  const filePathRef = React.useRef<string>('')
  const chatIDRef = React.useRef<string>('')

  const openTabContent = React.useCallback(
    async (pathOrChatID: string, optionalContentToWriteOnCreate?: string) => {
      if (!pathOrChatID) return
      // let chatID = ''
      const chatMetadata = allChatsMetadata.find((chat) => chat.id === pathOrChatID)
      // if (chatMetadata) {
      //   chatID = pathOrChatID
      // } else {
      //   chatID = getChatIdFromPath(pathOrChatID)
      // }
      if (chatMetadata) {
        const chatID = chatMetadata.id
        if (chatID === UNINITIALIZED_STATE) return
        const chat = await window.electronStore.getChat(chatID)
        setShowChatbot(true)
        setCurrentOpenChat(chat)
      } else {
        setShowChatbot(false)
        setSidebarShowing('files')
        openOrCreateFile(pathOrChatID, optionalContentToWriteOnCreate)
      }
    },
    [allChatsMetadata, setShowChatbot, setCurrentOpenChat, setSidebarShowing, openOrCreateFile],
  )

  // useEffect(() => {
  //   const fetchHistoryTabs = async () => {
  //     const response: Tab[] = await window.electronStore.getCurrentOpenTabs()
  //     setOpenTabs(response)
  //   }

  //   fetchHistoryTabs()
  // }, [])

  useEffect(() => {
    if (currentlyOpenFilePath != null && filePathRef.current !== currentlyOpenFilePath) {
      filePathRef.current = currentlyOpenFilePath
    }

    const currentChatHistoryId = currentOpenChat?.id ?? ''
    if (chatIDRef.current !== currentChatHistoryId) {
      chatIDRef.current = currentChatHistoryId
    }
  }, [currentOpenChat, allChatsMetadata, currentlyOpenFilePath])

  // const extractFileName = (path: string) => {
  //   const parts = path.split(/[/\\]/) // Split on both forward slash and backslash
  //   return parts.pop() || '' // Returns the last element, which is the file name
  // }

  /* Adds a new tab and syncs it with the backend */
  // const addTab = useCallback(
  //   (path: string) => {
  //     const createTabObjectFromPath = (tabPath: string) => {
  //       return {
  //         id: uuidv4(),
  //         path: tabPath,
  //         title: extractFileName(path),
  //         lastAccessed: true,
  //         // timeOpened: new Date(),
  //         // isDirty: false,
  //       }
  //     }

  //     const existingTab = openTabs.find((tab: Tab) => tab.path === path)
  //     if (existingTab) return
  //     const tab = createTabObjectFromPath(path)

  //     setOpenTabs((prevTabs) => {
  //       const newTabs = [...prevTabs, tab]
  //       window.electronStore.addOpenTabs(tab)
  //       return newTabs
  //     })
  //   },
  //   [openTabs],
  // )

  /* Removes a tab and syncs it with the backend */
  // const removeTabByID = useCallback(
  //   (tabId: string) => {
  //     let closedPath = ''
  //     let newIndex = -1
  //     let findIdx = -1

  //     setOpenTabs((prevTabs) => {
  //       findIdx = prevTabs.findIndex((tab: Tab) => tab.id === tabId)
  //       if (findIdx === -1) return prevTabs

  //       openTabs[findIdx].lastAccessed = false
  //       closedPath = findIdx !== -1 ? prevTabs[findIdx].path : ''
  //       newIndex = findIdx > 0 ? findIdx - 1 : 1

  //       if (closedPath === currentTabID) {
  //         if (newIndex < openTabs.length) {
  //           openTabs[newIndex].lastAccessed = true
  //           openTabContent(openTabs[newIndex].path)
  //         }
  //       }

  //       const nextTabs = prevTabs.filter((_, idx) => idx !== findIdx)

  //       const hasFileTabs = nextTabs.some((tab) => !getChatIdFromPath(tab.path))
  //       const hasChatTabs = nextTabs.some((tab) => getChatIdFromPath(tab.path))

  //       if (!hasFileTabs) {
  //         setCurrentlyOpenFilePath('')
  //       }

  //       if (!hasChatTabs) {
  //         setCurrentOpenChat(undefined)
  //       }

  //       return nextTabs
  //     })

  //     if (newIndex !== -1 && findIdx !== -1) {
  //       window.electronStore.removeOpenTabs(tabId, findIdx, newIndex)
  //     }
  //   },
  //   [openTabs, currentTabID, openTabContent, getChatIdFromPath, setCurrentlyOpenFilePath, setCurrentOpenChat],
  // )

  /* Updates tab order (on drag) and syncs it with backend */
  // const updateTabOrder = useCallback((draggedIndex: number, targetIndex: number) => {
  //   setOpenTabs((prevTabs) => {
  //     const newTabs = [...prevTabs]
  //     const [draggedTab] = newTabs.splice(draggedIndex, 1)
  //     newTabs.splice(targetIndex, 0, draggedTab)
  //     window.electronStore.updateOpenTabs(draggedIndex, targetIndex)
  //     return newTabs
  //   })
  // }, [])

  /* Selects a tab and syncs it with the backend */
  // const selectTab = useCallback(
  //   (selectedTab: Tab) => {
  //     setOpenTabs((prevTabs) => {
  //       const newTabs = prevTabs.map((tab) => ({
  //         ...tab,
  //         lastAccessed: tab.id === selectedTab.id,
  //       }))
  //       window.electronStore.selectOpenTabs(newTabs)
  //       return newTabs
  //     })

  //     if (getChatIdFromPath(selectedTab.path)) {
  //       if (sidebarShowing !== 'chats') setSidebarShowing('chats')
  //     } else if (sidebarShowing !== 'files') setSidebarShowing('files')

  //     openTabContent(selectedTab.path)
  //   },
  //   [openTabContent, setSidebarShowing, sidebarShowing, getChatIdFromPath],
  // )

  const TabContextMemo = useMemo(
    () => ({
      // currentTabID,
      openTabContent,
      // openTabs,
      // addTab,
      // removeTabByID,
      // updateTabOrder,
      // selectTab,
    }),
    [openTabContent],
  )

  return <TabContext.Provider value={TabContextMemo}>{children}</TabContext.Provider>
}
