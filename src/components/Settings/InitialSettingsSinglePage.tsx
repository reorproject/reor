import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import { YStack, H3, SizableText, XStack } from 'tamagui'
import ReorModal from '../Common/Modal'

import DirectorySelector from './DirectorySelector'
import InitialEmbeddingModelSettings from './EmbeddingSettings/InitialEmbeddingSettings'
import InitialSetupLLMSettings from './LLMSettings/InitialSetupLLMSettings'

interface OldInitialSettingsProps {
  readyForIndexing: () => void
}

const InitialSetupSinglePage: React.FC<OldInitialSettingsProps> = ({ readyForIndexing }) => {
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
    <ReorModal isOpen onClose={() => {}} hideCloseButton>
      <YStack className="ml-2 mr-4 w-[620px] py-3">
        <YStack className="ml-2 mt-0 h-[450px]  ">
          <H3 color="$gray13" fontWeight="semi-bold" className="mb-0 text-center text-2xl">
            Welcome to the Reor Project
          </H3>
          <SizableText color="$gray11" fontWeight={400} marginTop="$4" textAlign="center">
            Reor is a private AI personal knowledge management tool. Each note will be saved as a markdown file to a
            vault directory on your machine.
          </SizableText>
          <XStack className="mt-5 flex items-center justify-between border-0 border-b-2 border-solid border-neutral-700 pb-4">
            <YStack className="w-80 flex-col">
              <SizableText color="$gray13" fontWeight={600} fontSize={16}>
                Vault Directory
              </SizableText>
              <SizableText color="$black" fontSize={14} fontWeight={300} className="m-0 pt-1">
                Your vault directory doesn&apos;t need to be empty. Only markdown files will be indexed.
              </SizableText>
            </YStack>
            <div className="flex-col">
              <DirectorySelector setErrorMsg={setDirectoryErrorMsg} />
              {showError && directoryErrorMsg && <p className="text-xs text-red-500">{directoryErrorMsg}</p>}
            </div>
          </XStack>
          <div className="mt-2 border-0 border-b-2 border-solid border-neutral-700 pb-2">
            <InitialEmbeddingModelSettings setErrorMsg={setEmbeddingErrorMsg} />
            {showError && embeddingErrorMsg && <p className="text-xs text-red-500">{embeddingErrorMsg}</p>}
          </div>
          <XStack className="flex border-0 border-b-2 border-solid border-neutral-700 pb-2">
            <InitialSetupLLMSettings />
          </XStack>
        </YStack>
        <div className="flex justify-end">
          <Button
            className="mb-3 mt-4 h-10  w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={handleNext}
            placeholder=""
          >
            Next
          </Button>
        </div>
      </YStack>
    </ReorModal>
  )
}

export default InitialSetupSinglePage
