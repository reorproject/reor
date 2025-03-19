import React, { useState, useEffect } from 'react'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'
import { FiTrash2 } from 'react-icons/fi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DefaultLLMSelectorProps {
  llmConfigs: LLMConfig[]
  defaultLLM: string
  setDefaultLLM: (model: string) => void
}

const DefaultLLMSelector: React.FC<DefaultLLMSelectorProps> = ({ llmConfigs, defaultLLM, setDefaultLLM }) => {
  const [selectedLLM, setSelectedLLM] = useState(defaultLLM)

  useEffect(() => {
    setSelectedLLM(defaultLLM)
  }, [defaultLLM])

  const handleDefaultModelChange = (modelName: string) => {
    setSelectedLLM(modelName)
    setDefaultLLM(modelName)
    window.llm.setDefaultLLM(modelName)

    posthog.capture('change_default_llm', {
      defaultLLM: modelName,
    })
  }

  const handleDeleteLLM = async (modelName: string) => {
    // eslint-disable-next-line no-alert
    const confirmDelete = window.confirm(`Are you sure you want to delete the model ${modelName}?`)
    if (!confirmDelete) return

    await window.llm.deleteLLM(modelName)

    posthog.capture('delete_llm', {
      modelName,
    })
  }

  return (
    <Select onValueChange={handleDefaultModelChange} value={selectedLLM}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select default LLM" />
      </SelectTrigger>
      <SelectContent>
        {llmConfigs.map((config) => {
          const { modelName } = config
          return (
            <div key={modelName} className="flex w-full items-center justify-between">
              <SelectItem className="cursor-pointer" value={modelName}>
                {modelName}
              </SelectItem>
              {config.apiName === 'Ollama' && (
                <div className="cursor-pointer text-red-500">
                  <FiTrash2 onClick={() => handleDeleteLLM(modelName)} />
                </div>
              )}
            </div>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export default DefaultLLMSelector
