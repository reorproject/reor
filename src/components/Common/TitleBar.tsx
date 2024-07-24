import React, { useEffect, useState } from 'react'
import { PiSidebar, PiSidebarFill } from 'react-icons/pi'
import DraggableTabs from '../Sidebars/TabSidebar'
import FileHistoryNavigator from '../File/FileSideBar/FileHistoryBar'
import { useTabs, Tab } from '../Providers/TabProvider'

export const titleBarHeight = '30px'

interface TitleBarProps {
  onFileSelect: (path: string) => void
  currentFilePath: string | null // Used to create new open tabs when user clicks on new file to open
  similarFilesOpen: boolean
  toggleSimilarFiles: () => void
  history: string[]
  setHistory: (string: string[]) => void
  openFileAndOpenEditor: (path: string) => void
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  currentFilePath,
  similarFilesOpen,
  toggleSimilarFiles,
  history,
  setHistory,
  openFileAndOpenEditor,
}) => {
  const [platform, setPlatform] = useState('')
  const { openTabs, addTab, selectTab, removeTab, updateTabOrder } = useTabs()
  const [openedLastAccess, setOpenedLastAccess] = useState<boolean>(false)

  // Note: Do not put dependency on addTab or else removeTab does not work properly.
  // Typically you would define addTab inside the useEffect and then call it but since
  // we are using it inside a useContext we can remove it
  /* eslint-disable */
  useEffect(() => {
    if (!currentFilePath) return
    addTab(currentFilePath)
  }, [currentFilePath])
  /* eslint-enable */

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electronUtils.getPlatform()
      setPlatform(response)
    }

    fetchPlatform()
  }, [])

  useEffect(() => {
    const setUpLastAccess = () => {
      if (!openedLastAccess) {
        openTabs.forEach((tab: Tab) => {
          if (tab.lastAccessed) {
            setOpenedLastAccess(true)
            openFileAndOpenEditor(tab.filePath)
          }
        })
      }
    }

    setUpLastAccess()
  }, [openTabs, openFileAndOpenEditor, openedLastAccess])

  const handleTabSelect = (tab: Tab) => {
    selectTab(tab)
  }

  const handleTabClose = (event: MouseEvent, tabId: string) => {
    event.stopPropagation()
    removeTab(tabId)
  }

  return (
    <div id="customTitleBar" className="flex h-titlebar justify-between" style={{ backgroundColor: '#303030' }}>
      <div className="mt-px flex" style={platform === 'darwin' ? { marginLeft: '65px' } : { marginLeft: '2px' }}>
        <FileHistoryNavigator
          history={history}
          setHistory={setHistory}
          onFileSelect={onFileSelect}
          currentPath={currentFilePath || ''}
        />
      </div>

      <div className="scrollable-x-thin relative left-0 grow overflow-x-auto overflow-y-hidden">
        <div>
          <div className="flex whitespace-nowrap">
            <DraggableTabs
              openTabs={openTabs}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              currentFilePath={currentFilePath || ''}
              updateTabOrder={updateTabOrder}
            />
          </div>
        </div>
      </div>

      <div
        className="mt-[0.5px] flex justify-end"
        style={platform === 'win32' ? { marginRight: '8.5rem' } : { marginRight: '0.3rem' }}
      >
        {similarFilesOpen ? (
          <PiSidebarFill
            id="titleBarSimilarFiles"
            className="mt-[0.2rem] -scale-x-100 cursor-pointer text-gray-100"
            size={22}
            onClick={toggleSimilarFiles}
            title="Hide Similar Files"
          />
        ) : (
          <PiSidebar
            id="titleBarSimilarFiles"
            className="mt-[0.2rem] -scale-x-100 cursor-pointer text-gray-100"
            size={22}
            onClick={toggleSimilarFiles}
            title="Show Similar Files"
          />
        )}
      </div>
    </div>
  )
}

export default TitleBar
