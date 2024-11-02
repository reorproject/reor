import React, { useState } from 'react'
import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from '../../../lib/hooks/use-llm-configs'
import SettingsRow from '../Shared/SettingsRow'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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
        buttonText="Attach Local LLM"
        description="Attach a local LLM. Reor will download the model for you."
        onClick={() => setOpenModal('newLocalModel')}
      />
      <SettingsRow title="Setup Cloud LLM API" description="Add your API key (OpenAI or Anthropic)">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">Attach Cloud LLM</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {modalOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setOpenModal(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
