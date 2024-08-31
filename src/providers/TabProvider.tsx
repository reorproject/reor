import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { Tab } from 'electron/main/electron-store/storeConfig'
import { SidebarAbleToShow } from '../components/Sidebars/MainSidebar'
import { useChatContext } from './ChatContext'

interface TabContextType {
  openTabs: Tab[]
  addTab: (path: string) => void
  selectTab: (tab: Tab) => void
  removeTabByID: (tabId: string) => void
  updateTabOrder: (draggedIdx: number, targetIdx: number) => void
}

const defaultTypeContext: TabContextType = {
  openTabs: [],
  addTab: () => {},
  selectTab: () => {},
  removeTabByID: () => {},
  updateTabOrder: () => {},
}

const TabContext = createContext<TabContextType>(defaultTypeContext)

export const useTabs = (): TabContextType => useContext(TabContext)

interface TabProviderProps {
  children: ReactNode
  openTabContent: (path: string) => void
  setFilePath: (path: string) => void
  currentTab: string | null
  sidebarShowing: string | null
  makeSidebarShow: (option: SidebarAbleToShow) => void
  getChatIdFromPath: (path: string) => string
}

export const TabProvider: React.FC<TabProviderProps> = ({
  children,
  openTabContent,
  setFilePath,
  currentTab,
  sidebarShowing,
  makeSidebarShow,
  getChatIdFromPath,
}) => {
  const [openTabs, setOpenTabs] = useState<Tab[]>([])
  const { setCurrentChatHistory } = useChatContext()

  useEffect(() => {
    const fetchHistoryTabs = async () => {
      const response: Tab[] = await window.electronStore.getCurrentOpenTabs()
      setOpenTabs(response)
    }

    fetchHistoryTabs()
  }, [])

  useEffect(() => {
    const removeTabByPath = (tabs: Tab[]) => {
      setOpenTabs(tabs)
    }

    const removeTabByPathListener = window.ipcRenderer.receive('remove-tab-after-deletion', removeTabByPath)
    return () => {
      removeTabByPathListener()
    }
  }, [])

  const extractFileName = (path: string) => {
    const parts = path.split(/[/\\]/) // Split on both forward slash and backslash
    return parts.pop() || '' // Returns the last element, which is the file name
  }

  /* Adds a new tab and syncs it with the backend */
  const addTab = useCallback(
    (path: string) => {
      const createTabObjectFromPath = (tabPath: string) => {
        return {
          id: uuidv4(),
          path: tabPath,
          title: extractFileName(path),
          lastAccessed: true,
          // timeOpened: new Date(),
          // isDirty: false,
        }
      }

      const existingTab = openTabs.find((tab: Tab) => tab.path === path)
      if (existingTab) return
      const tab = createTabObjectFromPath(path)

      setOpenTabs((prevTabs) => {
        const newTabs = [...prevTabs, tab]
        window.electronStore.addOpenTabs(tab)
        return newTabs
      })
    },
    [openTabs],
  )

  /* Removes a tab and syncs it with the backend */
  const removeTabByID = useCallback(
    (tabId: string) => {
      let closedPath = ''
      let newIndex = -1
      let findIdx = -1

      setOpenTabs((prevTabs) => {
        findIdx = prevTabs.findIndex((tab: Tab) => tab.id === tabId)
        if (findIdx === -1) return prevTabs

        openTabs[findIdx].lastAccessed = false
        closedPath = findIdx !== -1 ? prevTabs[findIdx].path : ''
        newIndex = findIdx > 0 ? findIdx - 1 : 1

        if (closedPath === currentTab) {
          if (newIndex < openTabs.length) {
            openTabs[newIndex].lastAccessed = true
            openTabContent(openTabs[newIndex].path)
          }
        }

        const nextTabs = prevTabs.filter((_, idx) => idx !== findIdx)

        const hasFileTabs = nextTabs.some((tab) => !getChatIdFromPath(tab.path))
        const hasChatTabs = nextTabs.some((tab) => getChatIdFromPath(tab.path))

        if (!hasFileTabs) {
          setFilePath('')
        }

        if (!hasChatTabs) {
          setCurrentChatHistory(undefined)
        }

        return nextTabs
      })

      if (newIndex !== -1 && findIdx !== -1) {
        window.electronStore.removeOpenTabs(tabId, findIdx, newIndex)
      }
    },
    [currentTab, openTabContent, openTabs, setFilePath, setCurrentChatHistory, getChatIdFromPath],
  )

  /* Updates tab order (on drag) and syncs it with backend */
  const updateTabOrder = useCallback((draggedIndex: number, targetIndex: number) => {
    setOpenTabs((prevTabs) => {
      const newTabs = [...prevTabs]
      const [draggedTab] = newTabs.splice(draggedIndex, 1)
      newTabs.splice(targetIndex, 0, draggedTab)
      window.electronStore.updateOpenTabs(draggedIndex, targetIndex)
      return newTabs
    })
  }, [])

  /* Selects a tab and syncs it with the backend */
  const selectTab = useCallback(
    (selectedTab: Tab) => {
      setOpenTabs((prevTabs) => {
        const newTabs = prevTabs.map((tab) => ({
          ...tab,
          lastAccessed: tab.id === selectedTab.id,
        }))
        window.electronStore.selectOpenTabs(newTabs)
        return newTabs
      })

      if (getChatIdFromPath(selectedTab.path)) {
        if (sidebarShowing !== 'chats') makeSidebarShow('chats')
      } else if (sidebarShowing !== 'files') makeSidebarShow('files')

      openTabContent(selectedTab.path)
    },
    [openTabContent, makeSidebarShow, sidebarShowing, getChatIdFromPath],
  )

  const TabContextMemo = useMemo(
    () => ({
      openTabs,
      addTab,
      removeTabByID,
      updateTabOrder,
      selectTab,
    }),
    [openTabs, addTab, removeTabByID, updateTabOrder, selectTab],
  )

  return <TabContext.Provider value={TabContextMemo}>{children}</TabContext.Provider>
}
