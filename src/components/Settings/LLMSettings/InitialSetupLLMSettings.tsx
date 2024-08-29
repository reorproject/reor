import React from 'react'

import { CheckCircleIcon, CogIcon } from '@heroicons/react/24/solid'
import { Button } from '@material-tailwind/react'

import useLLMConfigs from './hooks/use-llm-configs'
import LLMSettingsContent from './LLMSettingsContent'

import ReorModal from '@/components/Common/Modal'

interface InitialSetupLLMSettingsProps {
  userHasCompleted?: (completed: boolean) => void
  userTriedToSubmit?: boolean
}

const InitialSetupLLMSettings: React.FC<InitialSetupLLMSettingsProps> = ({ userHasCompleted, userTriedToSubmit }) => {
  const [isSetupModalOpen, setIsSetupModalOpen] = React.useState<boolean>(false)
  const { llmConfigs, fetchAndUpdateModelConfigs } = useLLMConfigs()

  React.useEffect(() => {
    if (llmConfigs.length > 0) {
      userHasCompleted?.(true)
    }
  }, [llmConfigs, userHasCompleted])

  const isSetupComplete = llmConfigs.length > 0

  return (
    <div className="flex w-full flex-col justify-between rounded bg-dark-gray-c-three">
      <div className="flex items-center justify-between border-0 border-b-2 border-solid border-neutral-700 py-1">
        <p className="mb-2 pb-3 text-gray-100">LLM</p>
        <Button
          className={`flex cursor-pointer items-center justify-between rounded-md border border-none border-gray-300 px-3 py-2 ${
            isSetupComplete
              ? 'bg-green-700 text-white hover:bg-green-800'
              : 'bg-dark-gray-c-eight hover:bg-dark-gray-c-ten'
          } font-normal transition-colors duration-200`}
          onClick={() => setIsSetupModalOpen(true)}
          placeholder=""
        >
          {isSetupComplete ? (
            <>
              <CheckCircleIcon className="mr-2 size-5" />
              <span>Setup</span>
            </>
          ) : (
            <>
              <CogIcon className="mr-2 size-5" />
              <span>Setup</span>
            </>
          )}
        </Button>
        <ReorModal
          isOpen={isSetupModalOpen}
          onClose={() => {
            setIsSetupModalOpen(false)
            fetchAndUpdateModelConfigs()
          }}
        >
          <div className="p-5">
            <LLMSettingsContent />
          </div>
        </ReorModal>
      </div>
      {userTriedToSubmit && llmConfigs.length === 0 && (
        <p className="mt-1 text-sm text-red-500">Please set up at least one LLM.</p>
      )}
    </div>
  )
}

export default InitialSetupLLMSettings
