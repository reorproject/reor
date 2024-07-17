import React, { useEffect, useState } from 'react'
import { Button } from '@material-tailwind/react'
import Switch from '@mui/material/Switch'
import useFileByFilepath from '../File/hooks/use-file-by-filepath'

// enum SettingsAppearance {
//   light = "lightMode",
//   dark = "darkMode",
//   materialDark = "materialDarkMode",
//   lightBlue = "lightBlueMode",
//   /* custom = "NOT-YET-IMPLEMENTED */
// }

export interface GenSettingsProps {
  // iconSBIsCompact?: boolean /* True: Sets padding on Icon Sidebar */;
  // editorAppearance?: SettingsAppearance;
}

export const CreateAppearanceSection = ({}) => {
  const [isIconSBCompact, setIsIconSBCompact] = useState<boolean>(false);
  const [displayMarkdown, setDisplayMarkdown] = useState<boolean>(false);
  // const [editorAppearance, setEditorApperance] =
  //   useState<SettingsAppearance>("dark");

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
    <div className="flex-col w-full">
      <h4 className="text-white flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2 mb-1 mt-10">
        Appearance
      </h4>
      <div className="flex justify-between items-center w-full border-b-2 border-solid border-neutral-700 border-0 h-[64px]">
        <div className="flex flex-col justify-center">
          <p className="text-gray-100 opacity-80">
            IconSidebar Compact
            <p className="text-gray-100 text-xs pt-1 m-0">
              If on, decreases padding on IconSidebar
            </p>
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
      <div className="flex justify-between items-center w-full gap-5 border-0 pb-2 mb-1 mt-2 h-[64px] opacity-50">
        <div className="flex flex-col justify-center">
          <div className="flex gap-2">
            <p className="text-gray-100 m-0 opacity-80">
              Dynamic Markdown Heading
            </p>
            <span className="text-xs font-semibold py-1 px-2 bg-red-500 text-white rounded-full">
              Beta
            </span>
          </div>
          <p className="text-gray-100 text-xs pt-1 m-0">
            Allows you to manually change header markdown on hover
          </p>
        </div>
        <Switch
          checked={displayMarkdown}
          onChange={() => {
            setDisplayMarkdown(!displayMarkdown);
            if (displayMarkdown !== undefined) {
              window.electronStore.setDisplayMarkdown(!displayMarkdown);
            }
          }}
          disabled={true}
        />
      </div>
    </div>
  )
}

export const CreateEditorSection = () => {
  // const { spellCheckEnabled, setSpellCheckEnabled } = useFileByFilepath()
  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false)
  const [tempSpellCheckEnabled, setTempSpellCheckEnabled] = useState(false);
  const [editorFlexCenter, setEditorFlexCenter] = useState<boolean>(true);

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
    window.electronStore.setSpellCheckMode(setChecked);
    setTempSpellCheckEnabled(!tempSpellCheckEnabled);
    // setSpellCheckEnabled(tempSpellCheckEnabled)
    setUserHasMadeUpdate(false)
  }

  // Check if we should have flex center for our editor
  useEffect(() => {
    const fetchParams = async () => {
      const editorFlexCenter = await window.electronStore.getEditorFlexCenter();

      if (editorFlexCenter !== undefined) {
        setEditorFlexCenter(editorFlexCenter);
      }
    };

    fetchParams();
  }, []);

  return (
    <div className="flex-col w-full">
      <h4 className="text-white flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2 mb-1 mt-10">
        Editor
      </h4>
      <div className="flex-col">
        <div className="flex justify-between items-center w-full border-b-2 border-solid border-neutral-700 border-0 h-[64px]">
          <div className="flex flex-col justify-center">
            <p className="text-gray-100 opacity-80">
              Content Flex Center
              <p className="text-gray-100 text-xs pt-1 m-0">
                If on, centers content inside editor
              </p>
            </p>
          </div>
          <Switch
            checked={editorFlexCenter}
            onChange={() => {
              setEditorFlexCenter(!editorFlexCenter);
              if (editorFlexCenter !== undefined) {
                window.electronStore.setEditorFlexCenter(!editorFlexCenter);
              }
            }}
          />
        </div>
        <div className="flex justify-between items-center w-full border-b-2 border-solid border-neutral-700 border-0 h-[64px]">
          <div className="flex-col">
            <p className="mb-0 mt-1 text-sm text-gray-300">Spell Check</p>
            <p className="m-0 text-xs text-right italic text-gray-100 opacity-50">Note: Quit and restart the app for this to take effect</p>
          </div>
          <div className="flex justify-end items-end flex-col">
            <div className="flex items-end">
              <Switch
                checked={tempSpellCheckEnabled}
                onChange={() => {
                  setUserHasMadeUpdate(true)
                  handleSave(!tempSpellCheckEnabled);
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />
              {/* {userHasMadeUpdate && (
                <Button
                  // variant="contained"
                  placeholder=""
                  onClick={handleSave}
                  className="mb-0 mr-4 mt-2 h-8 w-[150px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
                >
                  Save
                </Button>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

