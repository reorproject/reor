import React, { useEffect, useState } from 'react';

import Switch from '@mui/material/Switch';

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

const CreateAppearanceSection: React.FC = () => {
  const [isIconSBCompact, setIsIconSBCompact] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [displayMarkdown, setDisplayMarkdown] = useState<boolean>(false);
  // const [editorAppearance, setEditorApperance] =
  //   useState<SettingsAppearance>("dark");

  // Check if SidebarCompact is on or not
  useEffect(() => {
    const fetchParams = async () => {
      const isIconSBCompact = await window.electronStore.getSBCompact();

      if (isIconSBCompact !== undefined) {
        setIsIconSBCompact(isIconSBCompact);
      }
    };

    fetchParams();
  }, []);

  // Check if we should display header markdown
  useEffect(() => {
    const fetchParams = async () => {
      const displayMarkdown = await window.electronStore.getDisplayMarkdown();

      if (displayMarkdown !== undefined) {
        setDisplayMarkdown(displayMarkdown);
      }
    };

    fetchParams();
  }, []);

  return (
    <div className='flex-col w-full'>
      <h4 className='text-white flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-4 mt-6'>
        Appearance
      </h4>
      <div className='flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-3 h-[64px]'>
        <div className='flex flex-col justify-center'>
          <p className='text-gray-100'>IconSidebar Compact</p>
          <p className='text-gray-100 text-xs'>
            If on, decreases padding on IconSidebar
          </p>
        </div>
        <Switch
          checked={isIconSBCompact}
          onChange={() => {
            setIsIconSBCompact(!isIconSBCompact);
            if (isIconSBCompact !== undefined) {
              window.electronStore.setSBCompact(!isIconSBCompact);
            }
          }}
        />
      </div>
      {/* <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-3 h-[64px] mt-6 opacity-50">
        <div className="flex flex-col justify-center">
          <div className="flex gap-2">
            <p className="text-gray-100 m-0">Dynamic Markdown Heading</p>
            <span className="text-xs font-semibold py-1 px-2 bg-red-500 text-white rounded-full">
              Beta
            </span>
          </div>
          <p className="text-gray-100 text-xs">
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
          disabled={false}
        />
      </div> */}
    </div>
  );
};

export default CreateAppearanceSection;
