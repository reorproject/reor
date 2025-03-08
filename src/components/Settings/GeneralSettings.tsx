import React, { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch'
import SettingsSection, { SettingsRow } from './Shared/SettingsRow'

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
    <SettingsSection title="Editor">
      <SettingsRow
        title="Content Flex Center"
        description="Centers content inside editor. Recommended for larger screens"
        control={
          <Switch
            checked={editorFlexCenter}
            onChange={() => {
              setEditorFlexCenter(!editorFlexCenter)
              if (editorFlexCenter !== undefined) {
                window.electronStore.setEditorFlexCenter(!editorFlexCenter)
              }
            }}
          />
        }
      />
      <SettingsRow
        title="Spell Check"
        description="Note: Quit and restart the app for this to take effect"
        control={
          <Switch
            checked={tempSpellCheckEnabled}
            onChange={() => {
              handleSaveSpellCheck(!tempSpellCheckEnabled)
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
      />
      <SettingsRow
        title="Document Statistics"
        description="Display real-time word and character statistics while editing your document"
        control={
          <Switch
            checked={documentStatsEnabled}
            onChange={() => {
              handleSaveDocStats(!documentStatsEnabled)
            }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
        divider={false}
      />
    </SettingsSection>
  )
}

export default EditorSection
