import React, { useEffect, useState } from 'react'
import { PiSidebar, PiSidebarFill } from 'react-icons/pi'
import DraggableTabs from '../Tabs/TabBar'
import FileHistoryNavigator from '../File/FileSideBar/FileHistoryBar'
import { ModalProvider } from '../Providers/ModalProvider'

export const titleBarHeight = '30px'

interface TitleBarProps {
  onFileSelect: (path: string) => void
  currentFilePath: string | null // Used to create new open tabs when user clicks on new file to open
  similarFilesOpen: boolean
  toggleSimilarFiles: () => void
  history: string[]
  setHistory: (string: string[]) => void
  openFileAndOpenEditor: (path: string) => void
  openAbsolutePath: (path: string) => void
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  currentFilePath,
  similarFilesOpen,
  toggleSimilarFiles,
  history,
  setHistory,
  openFileAndOpenEditor,
  openAbsolutePath,
}) => {
  const [platform, setPlatform] = useState('')

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electronUtils.getPlatform()
      setPlatform(response)
    }

    fetchPlatform()
  }, [])

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

      <div className="relative left-10 max-w-[75%] grow overflow-hidden">
        <div>
          <div className="flex whitespace-nowrap">
            <ModalProvider>
              <DraggableTabs
                currentFilePath={currentFilePath || ''}
                openFileAndOpenEditor={openFileAndOpenEditor}
                openAbsolutePath={openAbsolutePath}
              />
            </ModalProvider>
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
