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
  const [availableModels, setAvailableModels] = useState<LLMConfig[]>([])

  useEffect(() => {
    // Initialize OllamaService instance and fetch models
    const fetchModels = async () => {
      try {
        const models = await window.llm.getAvailableModels()
        setAvailableModels(models)
      } catch (error) {
        console.error('Error fetching models:', error)
      }
    }

    fetchModels()
  }, [])

  useEffect(() => {
    setSelectedLLM(defaultLLM)
  }, [defaultLLM])

  const handleDefaultModelChange = (selectedModel: string) => {
    setSelectedLLM(selectedModel)
    setDefaultLLM(selectedModel)
    window.llm.setDefaultLLM(selectedModel)
    posthog.capture('change_default_llm', {
      defaultLLM: selectedModel,
    })
  }

  const deleteLLM = async (modelName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the model ${modelName}?`)
    if (!confirmDelete) return
    try {
      await window.llm.deleteLLM(modelName)
      posthog.capture('delete_llm', {
        modelName,
      })
    } catch (error) {
      console.error(`Failed to delete model: ${modelName}`, error)
      window.alert(`Failed to delete the model ${modelName}`)
    }
  }

  return (
    <Select onValueChange={handleDefaultModelChange} value={selectedLLM}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select default LLM" />
      </SelectTrigger>
      <SelectContent>
        {llmConfigs.map((config) => (
          <div className="flex w-full items-center justify-end">
            <SelectItem key={config.modelName} value={config.modelName}>
              {config.modelName}
            </SelectItem>
            {availableModels.some((model) => model.modelName === config.modelName) && (
              <FiTrash2
                className="ml-2 cursor-pointer text-red-500"
                onClick={() => {
                  deleteLLM(config.modelName)
                }}
              />
            )}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}

export default DefaultLLMSelector
