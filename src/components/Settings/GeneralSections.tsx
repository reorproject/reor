import React, { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch'

export const AppearanceSection = () => {
  const [isIconSBCompact, setIsIconSBCompact] = useState<boolean>(false)

  // Check if SidebarCompact is on or not
  useEffect(() => {
    const fetchParams = async () => {
      const storedIsIconSBCompact = await window.electronStore.getSBCompact()

      if (storedIsIconSBCompact !== undefined) {
        setIsIconSBCompact(storedIsIconSBCompact)
      }
    }

    fetchParams()
  }, [])

  return (
    <div className="flex w-full flex-col">
      <h4 className="xs:text-sm mb-1 mt-10 flex w-full items-center justify-between gap-5 pb-2 text-lg text-white sm:text-base">
        Appearance
      </h4>
      <div className="h-[2px] w-full bg-neutral-700" />
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex flex-col justify-center">
          <p className="xs:text-xs flex flex-col text-base text-gray-100 opacity-80 sm:text-sm">
            IconSidebar Compact
            <span className="m-0 pt-1 text-xs text-gray-100">Decreases padding on IconSidebar</span>
          </p>
        </div>
        <Switch
          checked={isIconSBCompact}
          onChange={() => {
            setIsIconSBCompact(!isIconSBCompact)
            if (isIconSBCompact !== undefined) {
              window.electronStore.setSBCompact(!isIconSBCompact)
            }
          }}
        />
      </div>
      <div className="h-[2px] w-full bg-neutral-700" />
    </div>
  )
}

export const EditorSection = () => {
  // const { spellCheckEnabled, setSpellCheckEnabled } = useFileByFilepath()
  const [tempSpellCheckEnabled, setTempSpellCheckEnabled] = useState(false)
  const [documentStatsEnabled, setDocumentStatsEnabled] = useState(false)
  const [editorFlexCenter, setEditorFlexCenter] = useState<boolean>(true)

  useEffect(() => {
    const fetchParams = async () => {
      const isSpellCheckEnabled = await window.electronStore.getSpellCheckMode()
      const isDocumentStatsCheckEnabled = await window.electronStore.getDocumentStats()

      if (isSpellCheckEnabled !== undefined) {
        // setSpellCheckEnabled(isSpellCheckEnabled)
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
    <div className="w-full flex-col">
      <h4 className="xs:text-sm mb-1 mt-10 flex w-full items-center justify-between gap-5 pb-2 text-lg text-white sm:text-base">
        Editor
      </h4>
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
