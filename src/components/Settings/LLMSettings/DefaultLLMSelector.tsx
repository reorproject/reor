import React from 'react'

import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import CustomSelect from '../../Common/Select'

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

  const modelOptions = llmConfigs.map((config) => ({
    label: config.modelName,
    value: config.modelName,
  }))

  return (
    <CustomSelect options={modelOptions} selectedValue={defaultLLM} onChange={handleDefaultModelChange} centerText />
  )
}

export default DefaultLLMSelector
