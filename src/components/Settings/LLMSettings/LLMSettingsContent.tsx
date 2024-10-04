import React from 'react'

import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from './hooks/use-llm-configs'
import useModals from './hooks/use-modals'

import CustomSelect from '@/components/Common/Select'
import SettingsRow from '../Shared/SettingsRow'

interface LLMSettingsContentProps {}

const LLMSettingsContent: React.FC<LLMSettingsContentProps> = () => {
  const { llmConfigs, defaultLLM, setDefaultLLM, fetchAndUpdateModelConfigs } = useLLMConfigs()
  const { modals, openModal, closeModal } = useModals()

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
          </div>{' '}
          <div className="mb-1 flex w-[140px] min-w-[128px]">
            <DefaultLLMSelector llmConfigs={llmConfigs} defaultLLM={defaultLLM} setDefaultLLM={setDefaultLLM} />
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
      <SettingsRow title="Setup OpenAI or Anthropic" description="Add your API key">
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
