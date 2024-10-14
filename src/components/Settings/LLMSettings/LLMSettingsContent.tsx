import React from 'react'

import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from './hooks/use-llm-configs'
import useModals from './hooks/use-modals'

import SettingsRow from '../Shared/SettingsRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
        <SettingsRow title="Default LLM" description="Select your default language model">
          <DefaultLLMSelector llmConfigs={llmConfigs} defaultLLM={defaultLLM} setDefaultLLM={setDefaultLLM} />
        </SettingsRow>
      )}

      <SettingsRow
        title="Local LLM"
        buttonText="Add New Local LLM"
        description="Attach a local LLM. Reor will download the model for you."
        onClick={() => openModal('newLocalModel')}
      />
      <SettingsRow title="Setup OpenAI or Anthropic" description="Add your API key">
        <Select onValueChange={(value) => openModal(value as 'openai' | 'anthropic')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Attach Cloud LLM" />
          </SelectTrigger>
          <SelectContent>
            {modalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
