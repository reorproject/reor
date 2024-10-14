import React, { useState, useEffect } from 'react'

import { LLMGenerationParameters } from 'electron/main/electron-store/storeConfig'
import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from './hooks/use-llm-configs'
import useModals from './hooks/use-modals'

import SettingsRow from '../Shared/SettingsRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import TextGenerationSettings from './TextGeneration'
import { Button } from '@/components/ui/button'

interface LLMSettingsContentProps {}

const LLMSettingsContent: React.FC<LLMSettingsContentProps> = () => {
  const { llmConfigs, defaultLLM, setDefaultLLM, fetchAndUpdateModelConfigs } = useLLMConfigs()
  const { modals, openModal, closeModal } = useModals()

  const [textGenerationParams, setTextGenerationParams] = useState<LLMGenerationParameters>({
    temperature: 0.7,
  })
  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false)

  useEffect(() => {
    const fetchParams = async () => {
      const params = await window.electronStore.getLLMGenerationParams()
      if (params) {
        setTextGenerationParams(params)
      }
    }

    fetchParams()
  }, [])

  const handleSave = () => {
    if (textGenerationParams) {
      window.electronStore.setLLMGenerationParams(textGenerationParams)
      setUserHasMadeUpdate(false)
    }
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

      <SettingsRow title="Text Generation Settings" description="Configure temperature and max tokens">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-[180px]">
              Edit Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Text Generation Settings</DialogTitle>
            </DialogHeader>
            <TextGenerationSettings
              textGenerationParams={textGenerationParams}
              setTextGenerationParams={setTextGenerationParams}
              setUserHasMadeUpdate={setUserHasMadeUpdate}
            />
            {userHasMadeUpdate && (
              <Button onClick={handleSave} className="mt-4 w-full">
                Save
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </SettingsRow>

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
