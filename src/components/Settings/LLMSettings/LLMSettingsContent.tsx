import React, { useState } from 'react'
import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from '../../../lib/hooks/use-llm-configs'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import DefaultLLMAPISetupModal from './modals/DefaultLLMAPISetupModal'
import NewOllamaModelModal from './modals/NewOllamaModel'
import CustomLLMAPISetupModal from './modals/CustomLLMAPISetup'
import SettingsSection, { SettingsRow } from '../Shared/SettingsRow'

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
    <SettingsSection title="LLM">
      <SettingsRow
        title="Default LLM"
        description="Select your default language model"
        control={<DefaultLLMSelector llmConfigs={llmConfigs} defaultLLM={defaultLLM} setDefaultLLM={setDefaultLLM} />}
      />

      <SettingsRow
        title="Local LLM"
        description="Attach a local LLM. Reor will download the model for you."
        control={
          <Button variant="secondary" onClick={() => setOpenModal('newLocalModel')}>
            Attach Local LLM
          </Button>
        }
      />

      <SettingsRow
        title="Setup Cloud LLM API"
        description="Add your API key (OpenAI or Anthropic)"
        control={
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
        }
      />

      <SettingsRow
        title="Setup a custom LLM API"
        description="I.e. a non-OpenAI/Anthropic LLM"
        control={
          <Button variant="secondary" onClick={() => setOpenModal('remoteLLM')}>
            Custom LLM Setup
          </Button>
        }
        divider={false}
      />

      <NewOllamaModelModal isOpen={openModal === 'newLocalModel'} onClose={closeModal} />
      <CustomLLMAPISetupModal isOpen={openModal === 'remoteLLM'} onClose={closeModal} />
      <DefaultLLMAPISetupModal isOpen={openModal === 'openai'} onClose={closeModal} apiInterface="openai" />
      <DefaultLLMAPISetupModal isOpen={openModal === 'anthropic'} onClose={closeModal} apiInterface="anthropic" />
    </SettingsSection>
  )
}

export default LLMSettingsContent
