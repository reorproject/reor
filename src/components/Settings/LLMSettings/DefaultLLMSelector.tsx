import React from 'react'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DefaultLLMSelectorProps {
  llmConfigs: LLMConfig[]
  defaultLLM: string
  setDefaultLLM: (model: string) => void
}

const DefaultLLMSelector: React.FC<DefaultLLMSelectorProps> = ({ llmConfigs, defaultLLM, setDefaultLLM }) => {
  const handleDefaultModelChange = (selectedModel: string) => {
    setDefaultLLM(selectedModel)
    window.llm.setDefaultLLM(selectedModel)
    posthog.capture('change_default_llm', {
      defaultLLM: selectedModel,
    })
  }

  return (
    <Select onValueChange={handleDefaultModelChange} defaultValue={defaultLLM}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select default LLM" />
      </SelectTrigger>
      <SelectContent>
        {llmConfigs.map((config) => (
          <SelectItem key={config.modelName} value={config.modelName}>
            {config.modelName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default DefaultLLMSelector
