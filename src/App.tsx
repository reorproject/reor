import React, { useEffect, useState } from 'react'

import { Portal } from '@headlessui/react'
import posthog from 'posthog-js'
import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import IndexingProgress from './components/Common/IndexingProgress'
import MainPageComponent from './components/MainPage'
import InitialSetupSinglePage from './components/Settings/InitialSettingsSinglePage'
import { ThemeProvider } from './contexts/ThemeContext'

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [userHasConfiguredSettingsForIndexing, setUserHasConfiguredSettingsForIndexing] = useState<boolean>(false)

  const [indexingProgress, setIndexingProgress] = useState<number>(0)

  useEffect(() => {
    const handleProgressUpdate = (newProgress: number) => {
      setIndexingProgress(newProgress)
    }
    window.ipcRenderer.receive('indexing-progress', handleProgressUpdate)
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.add('dark')
  }, [])

  useEffect(() => {
    const initialisePosthog = async () => {
      if (await window.electronStore.getAnalyticsMode()) {
        posthog.init('phc_xi4hFToX1cZU657yzge1VW0XImaaRzuvnFUdbAKI8fu', {
          api_host: 'https://us.i.posthog.com',
          autocapture: false,
        })
        posthog.register({
          reorAppVersion: await window.electronUtils.getReorAppVersion(),
        })
      }
    }
    initialisePosthog()
  }, [])

  useEffect(() => {
    const handleIndexingError = (error: string) => {
      toast.error(error, {
        className: 'mt-5',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      })
      setIndexingProgress(1)
    }
    window.ipcRenderer.receive('error-to-display-in-window', handleIndexingError)
  }, [])

  useEffect(() => {
    const fetchSettings = async () => {
      const [initialDirectory, defaultEmbedFunc] = await Promise.all([
        window.electronStore.getVaultDirectoryForWindow(),
        window.electronStore.getDefaultEmbeddingModel(),
      ])
      if (initialDirectory && defaultEmbedFunc) {
        setUserHasConfiguredSettingsForIndexing(true)
        window.database.indexFilesInDirectory()
      }
    }

    fetchSettings()
  }, [])

  const handleAllInitialSettingsAreReady = () => {
    setUserHasConfiguredSettingsForIndexing(true)
    window.database.indexFilesInDirectory()
  }

  return (
    <ThemeProvider>
      <div className="max-h-screen font-sans">
        <Portal>
          <ToastContainer
            theme="dark"
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            toastClassName="text-xs" // Added max height and overflow
          />{' '}
        </Portal>
        {!userHasConfiguredSettingsForIndexing && (
          <InitialSetupSinglePage readyForIndexing={handleAllInitialSettingsAreReady} />
        )}
        {userHasConfiguredSettingsForIndexing && indexingProgress < 1 && (
          <IndexingProgress indexingProgress={indexingProgress} />
        )}
        {userHasConfiguredSettingsForIndexing && indexingProgress >= 1 && <MainPageComponent />}
      </div>
    </ThemeProvider>
  )
}

export default App
