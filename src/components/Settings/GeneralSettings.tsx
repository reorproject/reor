import React, { useEffect, useState } from 'react'

import { Button } from '@material-tailwind/react'
import Switch from '@mui/material/Switch'

import useFileByFilepath from '../File/hooks/use-file-by-filepath'

import {  CreateAppearanceSection, GenSettingsProps, CreateEditorSection } from './GeneralSections'

/*
 *  General Page has the following format:
 *
 * SubHeader 1
 * =============
 *
 * OptionA for subheader
 * ----------------------
 * OptioNB for subheader
 * ---------------------
 *
 * SubHeader 2
 * =============
 *
 *
 * SubHeader describe the part of the project you are changing (appearance, editor, sidebar, etc..). Option(s) is the name of the specific change.
 */

const GeneralSettings: React.FC<GenSettingsProps> = () => {
  return (
    <div className="w-full flex-col justify-between rounded bg-dark-gray-c-three">
      <h2 className="mb-0 text-2xl font-semibold text-white">General</h2>
      <CreateAppearanceSection />
      <CreateEditorSection />
    </div>
  )
}

export default GeneralSettings
