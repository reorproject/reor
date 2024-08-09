import React, { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch'

export const AppearanceSection = () => {
  const [isIconSBCompact, setIsIconSBCompact] = useState<boolean>(false)
  const [displayMarkdown, setDisplayMarkdown] = useState<boolean>(false)

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
    <div className="w-full flex-col">
      <h4 className="mb-1 mt-10 flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2 text-white">
        Appearance
      </h4>
      <div className="flex h-[64px] w-full items-center justify-between border-0 border-b-2 border-solid border-neutral-700">
        <div className="flex flex-col justify-center">
          <p className="text-gray-100 opacity-80">
            IconSidebar Compact
            <p className="m-0 pt-1 text-xs text-gray-100">If on, decreases padding on IconSidebar</p>
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
      <div className="mb-1 mt-2 flex h-[64px] w-full items-center justify-between gap-5 border-0 pb-2 opacity-50">
        <div className="flex flex-col justify-center">
          <div className="flex gap-2">
            <p className="m-0 text-gray-100 opacity-80">Dynamic Markdown Heading</p>
            <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">Beta</span>
          </div>
          <p className="m-0 pt-1 text-xs text-gray-100">Allows you to manually change header markdown on hover</p>
        </div>
        <Switch
          checked={displayMarkdown}
          onChange={() => {
            setDisplayMarkdown(!displayMarkdown)
            if (displayMarkdown !== undefined) {
              window.electronStore.setDisplayMarkdown(!displayMarkdown)
            }
          }}
          disabled
        />
      </div>
    </div>
  )
}

export const EditorSection = () => {
  // const { spellCheckEnabled, setSpellCheckEnabled } = useFileByFilepath()
  const [tempSpellCheckEnabled, setTempSpellCheckEnabled] = useState(false)
  const [editorFlexCenter, setEditorFlexCenter] = useState<boolean>(true)

  useEffect(() => {
    const fetchParams = async () => {
      const isSpellCheckEnabled = await window.electronStore.getSpellCheckMode()

      if (isSpellCheckEnabled !== undefined) {
        // setSpellCheckEnabled(isSpellCheckEnabled)
        setTempSpellCheckEnabled(isSpellCheckEnabled)
      }
    }

    fetchParams()
  }, [])

  const handleSave = (setChecked: boolean) => {
    // Execute the save function here
    window.electronStore.setSpellCheckMode(setChecked)
    setTempSpellCheckEnabled(!tempSpellCheckEnabled)
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
      <h4 className="mb-1 mt-10 flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2 text-white">
        Editor
      </h4>
      <div className="flex-col">
        <div className="flex h-[64px] w-full items-center justify-between border-0 border-b-2 border-solid border-neutral-700">
          <div className="flex flex-col justify-center">
            <p className="text-gray-100 opacity-80">
              Content Flex Center
              <p className="m-0 pt-1 text-xs text-gray-100">
                If on, centers content inside editor. Recommended for larger screens
              </p>
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
        <div className="flex h-[64px] w-full items-center justify-between border-0 border-b-2 border-solid border-neutral-700">
          <div className="flex-col">
            <p className="mb-0 mt-1 text-sm text-gray-300">Spell Check</p>
            <p className="m-0 text-right text-xs italic text-gray-100 opacity-50">
              Note: Quit and restart the app for this to take effect
            </p>
          </div>
          <div className="flex flex-col items-end justify-end">
            <div className="flex items-end">
              <Switch
                checked={tempSpellCheckEnabled}
                onChange={() => {
                  handleSave(!tempSpellCheckEnabled)
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
