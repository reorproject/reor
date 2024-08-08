import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Tab } from 'electron/main/electron-store/storeConfig'
import { SidebarAbleToShow } from '../Sidebars/MainSidebar'

interface TabProviderProps {
  children: ReactNode
  openFileAndOpenEditor: (path: string) => void
  setFilePath: (path: string) => void
  currentFilePath: string | null
  sidebarShowing: string | null
  makeSidebarShow: (option: SidebarAbleToShow) => void
}

interface TabContextType {
  openTabs: Tab[]
  addTab: (path: string) => void
  selectTab: (tab: Tab) => void
  removeTab: (tabId: string) => void
  updateTabOrder: (draggedIdx: number, targetIdx: number) => void
}

const defaultTypeContext: TabContextType = {
  openTabs: [],
  addTab: () => {},
  selectTab: () => {},
  removeTab: () => {},
  updateTabOrder: () => {},
}

const TabContext = createContext<TabContextType>(defaultTypeContext)

// Contains openTabs, addTab, selectTab, removeTab, updateTabOrder
export const useTabs = (): TabContextType => useContext(TabContext)

export const TabProvider: React.FC<TabProviderProps> = ({
  children,
  openFileAndOpenEditor,
  setFilePath,
  currentFilePath,
  sidebarShowing,
  makeSidebarShow,
}) => {
  const [openTabs, setOpenTabs] = useState<Tab[]>([])

  useEffect(() => {
    const fetchHistoryTabs = async () => {
      const response: Tab[] = await window.electronStore.getCurrentOpenTabs()
      setOpenTabs(response)
    }

    fetchHistoryTabs()
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
          filePath: tabPath,
          title: extractFileName(path),
          lastAccessed: true,
          // timeOpened: new Date(),
          // isDirty: false,
        }
      }

      const existingTab = openTabs.find((tab: Tab) => tab.filePath === path)
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
  const removeTab = useCallback(
    (tabId: string) => {
      let closedFilePath = ''
      let newIndex = -1
      let findIdx = -1

      setOpenTabs((prevTabs) => {
        findIdx = prevTabs.findIndex((tab: Tab) => tab.id === tabId)
        if (findIdx === -1) return prevTabs

        openTabs[findIdx].lastAccessed = false
        closedFilePath = findIdx !== -1 ? prevTabs[findIdx].filePath : ''
        newIndex = findIdx > 0 ? findIdx - 1 : 1

        if (closedFilePath === currentFilePath) {
          if (newIndex < openTabs.length) {
            openTabs[newIndex].lastAccessed = true
            openFileAndOpenEditor(openTabs[newIndex].filePath)
          }
          // Select the new index's file
          else setFilePath('')
        }

        return prevTabs.filter((_, idx) => idx !== findIdx)
      })

      if (newIndex !== -1 && findIdx !== -1) {
        window.electronStore.removeOpenTabs(tabId, findIdx, newIndex)
      }
    },
    [currentFilePath, openFileAndOpenEditor, openTabs, setFilePath],
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
      if (sidebarShowing !== 'files') makeSidebarShow('files')
      openFileAndOpenEditor(selectedTab.filePath)
    },
    [openFileAndOpenEditor, makeSidebarShow, sidebarShowing],
  )

  const TabContextMemo = useMemo(
    () => ({
      openTabs,
      addTab,
      removeTab,
      updateTabOrder,
      selectTab,
    }),
    [openTabs, addTab, removeTab, updateTabOrder, selectTab],
  )

  return <TabContext.Provider value={TabContextMemo}>{children}</TabContext.Provider>
}
