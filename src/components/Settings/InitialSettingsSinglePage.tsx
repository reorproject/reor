import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'

import ReorModal from '../Common/Modal'

import DirectorySelector from './DirectorySelector'
import InitialEmbeddingModelSettings from './EmbeddingSettings/InitialEmbeddingSettings'
import InitialSetupLLMSettings from './LLMSettings/InitialSetupLLMSettings'

interface OldInitialSettingsProps {
  readyForIndexing: () => void
  onClose?: () => void
}

const InitialSetupSinglePage: React.FC<OldInitialSettingsProps> = ({ readyForIndexing, onClose }) => {
  const [directoryErrorMsg, setDirectoryErrorMsg] = useState('')
  const [embeddingErrorMsg, setEmbeddingErrorMsg] = useState('')
  const [showError, setShowError] = useState(false)

  const handleNext = () => {
    if (!directoryErrorMsg && !embeddingErrorMsg) {
      readyForIndexing()
    } else {
      setShowError(true)
    }
  }

  return (
    <ReorModal isOpen onClose={onClose || (() => {})} hideCloseButton={!onClose}>
      <div className="ml-2 mr-4 w-[620px] py-3">
        <div className="ml-2 mt-0 h-[450px]  ">
          <h2 className="mb-0 text-center text-2xl font-semibold text-white">Welcome to the Reor Project</h2>
          <p className="mt-2 text-center text-gray-100">
            Reor is a private AI personal knowledge management tool. Each note will be saved as a markdown file to a
            vault directory on your machine.
          </p>
          <div className="mt-10 flex items-center justify-between border-0 border-b-2 border-solid border-neutral-700 pb-4">
            <div className="w-80 flex-col">
              <p className="m-0 text-gray-100">Vault Directory</p>
              <p className="m-0 pt-1 text-xs text-gray-100 opacity-40">
                Your vault directory doesn&apos;t need to be empty. Only markdown files will be indexed.
              </p>
            </div>
            <div className="flex-col">
              <DirectorySelector setErrorMsg={setDirectoryErrorMsg} />
              {showError && directoryErrorMsg && <p className="text-xs text-red-500">{directoryErrorMsg}</p>}
            </div>
          </div>
          <div className="mt-2 border-0 border-b-2 border-solid border-neutral-700 pb-2">
            <InitialEmbeddingModelSettings setErrorMsg={setEmbeddingErrorMsg} />
            {showError && embeddingErrorMsg && <p className="text-xs text-red-500">{embeddingErrorMsg}</p>}
          </div>
          <InitialSetupLLMSettings />
        </div>
        <div className="flex justify-end">
          <Button
            className="mb-3 mt-4 h-10  w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={handleNext}
            placeholder=""
          >
            Next
          </Button>
        </div>
      </div>
    </ReorModal>
  )
}

export default InitialSetupSinglePage