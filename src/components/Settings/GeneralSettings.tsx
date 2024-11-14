import React, { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch'

export const EditorSection = () => {
  const [tempSpellCheckEnabled, setTempSpellCheckEnabled] = useState(false)
  const [documentStatsEnabled, setDocumentStatsEnabled] = useState(false)
  const [editorFlexCenter, setEditorFlexCenter] = useState<boolean>(true)

  useEffect(() => {
    const fetchParams = async () => {
      const isSpellCheckEnabled = await window.electronStore.getSpellCheckMode()
      const isDocumentStatsCheckEnabled = await window.electronStore.getDocumentStats()

      if (isSpellCheckEnabled !== undefined) {
        setTempSpellCheckEnabled(isSpellCheckEnabled)
      }
      if (isDocumentStatsCheckEnabled !== undefined) {
        setDocumentStatsEnabled(isDocumentStatsCheckEnabled)
      }
    }

    fetchParams()
  }, [])

  const handleSaveSpellCheck = (setChecked: boolean) => {
    // Execute the save function here
    window.electronStore.setSpellCheckMode(setChecked)
    setTempSpellCheckEnabled(!tempSpellCheckEnabled)
  }
  const handleSaveDocStats = async (setChecked: boolean) => {
    // Execute the save function here
    await window.electronStore.setDocumentStats(setChecked)
    setDocumentStatsEnabled(!documentStatsEnabled)
  }

  // Check if we should have flex center for our editor
  useEffect(() => {
    const fetchParams = async () => {
      const getEditorFlexCenter = await window.electronStore.getEditorFlexCenter()

      if (getEditorFlexCenter !== undefined) {
        setEditorFlexCenter(getEditorFlexCenter)
      }
    }

    fetchParams()
  }, [])

  return (
    <div className="w-full flex-col pt-4">
      <div className="h-[2px] w-full bg-neutral-700" />
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex w-[70%] flex-col justify-center">
          <p className="xs:text-xs flex flex-col text-base text-gray-100 opacity-80 sm:text-sm">
            Content Flex Center
            <span className="m-0 pt-1 text-xs text-gray-100">
              Centers content inside editor. Recommended for larger screens
            </span>
          </p>
        </div>
        <Switch
          checked={editorFlexCenter}
          onChange={() => {
            setEditorFlexCenter(!editorFlexCenter)
            if (editorFlexCenter !== undefined) {
              window.electronStore.setEditorFlexCenter(!editorFlexCenter)
            }
          }}
        />
      </div>
      <div className="h-[2px] w-full bg-neutral-700" />
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex w-[70%] flex-col justify-center">
          <p className="xs:text-xs flex flex-col text-base text-gray-100 opacity-80 sm:text-sm">
            Spell Check
            <span className="m-0 pt-1 text-xs text-gray-100">
              Note: Quit and restart the app for this to take effect
            </span>
          </p>
        </div>
        <Switch
          checked={tempSpellCheckEnabled}
          onChange={() => {
            handleSaveSpellCheck(!tempSpellCheckEnabled)
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </div>
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex w-[70%] flex-col justify-center">
          <p className="xs:text-xs flex flex-col text-base text-gray-100 opacity-80 sm:text-sm">
            Document Statistics
            <span className="m-0 pt-1 text-xs text-gray-100">
              Display real-time word and character statistics while editing your document
            </span>
          </p>
        </div>
        <Switch
          checked={documentStatsEnabled}
          onChange={() => {
            handleSaveDocStats(!documentStatsEnabled)
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </div>
      <div className="h-[2px] w-full bg-neutral-700" />
    </div>
  )
}

const GeneralSettings = () => {
  return (
    <div className="w-full flex-col justify-between rounded bg-dark-gray-c-three">
      <h2 className="mb-0 text-2xl font-semibold text-white">Editor</h2>
      <EditorSection />
    </div>
  )
}

export default GeneralSettings
