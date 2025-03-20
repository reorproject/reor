import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'

import ReorModal from '../Common/Modal'

import DirectorySelector from './DirectorySelector'
import InitialEmbeddingModelSettings from './EmbeddingSettings/InitialEmbeddingSettings'
import InitialSetupLLMSettings from './LLMSettings/InitialSetupLLMSettings'
import { YStack, H2, SizableText, XStack } from 'tamagui'

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
      <YStack className="ml-2 mr-4 w-[620px] py-3">
        <YStack className="ml-2 mt-0 h-[450px]  ">
          <H2 
            marginBottom={0}
            textAlign='center'
            fontWeight={600}>Welcome to the Reor Project</H2>
          <SizableText 
            marginTop={3}
            textAlign='center'
            fontWeight={300}
          >
            Reor is a private AI personal knowledge management tool. Each note will be saved as a markdown file to a
            vault directory on your machine.
          </SizableText>
          <XStack className="mt-10 flex items-center justify-between border-0 border-b-2 border-solid border-neutral-700 pb-4">
            <YStack className="w-80 flex-col">
              <SizableText fontSize={16} fontWeight='bold'>Vault Directory</SizableText>
              <SizableText 
                margin={0}
                paddingTop={1}
                fontSize={12}
              >
                Your vault directory doesn&apos;t need to be empty. Only markdown files will be indexed.
              </SizableText>
            </YStack>
            <YStack className="flex-col">
              <DirectorySelector setErrorMsg={setDirectoryErrorMsg} />
              {showError && directoryErrorMsg && <SizableText className="text-xs text-red-500">{directoryErrorMsg}</SizableText>}
            </YStack>
          </XStack>
          <YStack className="mt-2 border-0 border-b-2 border-solid border-neutral-700 pb-2">
            <InitialEmbeddingModelSettings setErrorMsg={setEmbeddingErrorMsg} />
            {showError && embeddingErrorMsg && <SizableText className="text-xs text-red-500">{embeddingErrorMsg}</SizableText>}
          </YStack>
          <InitialSetupLLMSettings />
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
