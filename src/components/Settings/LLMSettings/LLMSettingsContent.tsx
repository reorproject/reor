import React, { useState } from 'react'

import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from './hooks/use-llm-configs'
import SettingsRow from '../Shared/SettingsRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import DefaultLLMAPISetupModal from './modals/DefaultLLMAPISetupModal'
import NewOllamaModelModal from './modals/NewOllamaModel'
import CustomLLMAPISetupModal from './modals/CustomLLMAPISetup'

interface LLMSettingsContentProps {}

const LLMSettingsContent: React.FC<LLMSettingsContentProps> = () => {
  const { llmConfigs, defaultLLM, setDefaultLLM, fetchAndUpdateModelConfigs } = useLLMConfigs()

  const [openModal, setOpenModal] = useState<string | null>(null)

  const closeModal = () => {
    setOpenModal(null)
    fetchAndUpdateModelConfigs()
  }

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
        onClick={() => setOpenModal('newLocalModel')}
      />
      <SettingsRow title="Setup OpenAI or Anthropic" description="Add your API key">
        <Select onValueChange={(value) => setOpenModal(value)}>
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
        title="Setup a custom LLM API"
        description="I.e. a non-OpenAI/Anthropic LLM"
        buttonText="Custom LLM Setup"
        onClick={() => setOpenModal('remoteLLM')}
      />

      <NewOllamaModelModal isOpen={openModal === 'newLocalModel'} onClose={closeModal} />
      <CustomLLMAPISetupModal isOpen={openModal === 'remoteLLM'} onClose={closeModal} />
      <DefaultLLMAPISetupModal isOpen={openModal === 'openai'} onClose={closeModal} apiInterface="openai" />
      <DefaultLLMAPISetupModal isOpen={openModal === 'anthropic'} onClose={closeModal} apiInterface="anthropic" />
    </div>
  )
}

export default LLMSettingsContent
