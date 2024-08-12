import React, { useState, useEffect } from 'react'

import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from './hooks/useLLMConfigs'
import useModals from './hooks/useModals'

import CustomSelect from '@/components/Common/Select'
import SettingsRow from '../Shared/SettingsRow'

interface LLMSettingsContentProps {
  userHasCompleted?: (completed: boolean) => void
  userTriedToSubmit?: boolean
  isInitialSetup: boolean
}

const LLMSettingsContent: React.FC<LLMSettingsContentProps> = ({
  userHasCompleted,
  userTriedToSubmit,
  isInitialSetup,
}) => {
  const { llmConfigs, defaultLLM, setDefaultLLM, fetchAndUpdateModelConfigs } = useLLMConfigs()
  const { modals, openModal, closeModal } = useModals()

  const [userMadeChanges, setUserMadeChanges] = useState<boolean>(false)
  const [currentError, setCurrentError] = useState<string>('')

  useEffect(() => {
    if (defaultLLM) {
      setCurrentError('')
      userHasCompleted?.(true)
    } else {
      setCurrentError('No model selected')
      userHasCompleted?.(false)
    }
  }, [defaultLLM, userHasCompleted])

  const handleModelChange = (model: string) => {
    setUserMadeChanges(true)
    userHasCompleted?.(!!model)
  }

  const modalOptions = [
    { label: 'OpenAI Setup', value: 'openai' },
    { label: 'Anthropic Setup', value: 'anthropic' },
  ]

  return (
    <div>
      <h2 className="mb-4 font-semibold text-white">LLM</h2>
      {llmConfigs.length > 0 && (
        <div className="flex w-full flex-wrap items-center justify-between gap-5 pb-2">
          {/* <h4 className="text-gray-200 text-center font-normal">Default LLM</h4> */}
          <div className="flex-col">
            <p className="mt-5 text-gray-100">Default LLM</p>
          </div>
          <div className="mb-1 flex w-[140px] min-w-[128px]">
            <DefaultLLMSelector
              onModelChange={handleModelChange}
              llmConfigs={llmConfigs}
              defaultLLM={defaultLLM}
              setDefaultLLM={setDefaultLLM}
            />
          </div>
        </div>
      )}
      <div className="h-[2px] w-full bg-neutral-700" />
      <SettingsRow
        title="Local LLM"
        buttonText="Add New Local LLM"
        description="Attach a local LLM. Reor will download the model for you."
        onClick={() => openModal('newLocalModel')}
      />
      <SettingsRow title="Setup OpenAI/Anthropic" description="Add your API key">
        <CustomSelect
          options={modalOptions}
          selectedValue="Attach Cloud LLM"
          onChange={(value) => openModal(value as 'openai' | 'anthropic')}
          centerText
        />
      </SettingsRow>
      <SettingsRow
        title="Setup remote LLMs"
        description="Non-OpenAI/Anthropic LLMs"
        buttonText="Remote LLM Setup"
        onClick={() => openModal('remoteLLM')}
      />
      {!isInitialSetup && userMadeChanges && (
        <p className="mt-1 text-xs text-slate-100">
          Note: You&apos;ll need to refresh the chat window to apply these changes.
        </p>
      )}
      {userTriedToSubmit && !defaultLLM && <p className="mt-1 text-sm text-red-500">{currentError}</p>}
      {/* Render modals */}
      {Object.entries(modals).map(([key, { isOpen, Component }]) => (
        <Component
          key={key}
          isOpen={isOpen}
          onClose={() => {
            closeModal(key as keyof typeof modals)
            fetchAndUpdateModelConfigs()
          }}
        />
      ))}
    </div>
  )
}

export default LLMSettingsContent
