import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import { OpenAILLMConfig, AnthropicLLMConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import ReorModal from '../../../Common/Modal'

export interface CloudLLMSetupModalProps {
  isOpen: boolean
  onClose: () => void
  LLMType: 'openai' | 'anthropic'
  refreshLLMs?: () => void
}

const CloudLLMSetupModal: React.FC<CloudLLMSetupModalProps> = ({ isOpen, onClose, LLMType, refreshLLMs }) => {
  const [openKey, setOpenKey] = useState('')

  const defaultModels = LLMType === 'openai' ? openAIDefaultModels : AnthropicDefaultModels
  const LLMDisplayName = LLMType === 'openai' ? 'OpenAI' : 'Anthropic'

  const handleSave = async () => {
    console.log('openKey:', openKey)
    if (openKey) {
      for (const modelConfig of defaultModels) {
        console.log('modelConfig:', modelConfig)
        posthog.capture('save_cloud_llm', {
          modelName: modelConfig.modelName,
          llmType: LLMType,
          contextLength: modelConfig.contextLength,
        })
        modelConfig.apiKey = openKey
        console.log('saving modelConfig:', modelConfig)
        await window.llm.addOrUpdateLLM(modelConfig)
      }
      if (defaultModels.length > 0) {
        window.llm.setDefaultLLM(defaultModels[0].modelName)
      }
      if (refreshLLMs) {
        refreshLLMs()
      }
    }

    onClose()
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <ReorModal isOpen={isOpen} onClose={handleSave}>
      <div className="mb-2 ml-3 mr-2 w-[300px]">
        <h3 className="mb-0 font-semibold text-white">{LLMDisplayName} Setup</h3>
        <p className="my-2 text-sm text-gray-100">Enter your {LLMDisplayName} API key below:</p>
        <input
          type="text"
          className="focus:shadow-outline-blue box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={openKey}
          onChange={(e) => setOpenKey(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={`${LLMDisplayName} API Key`}
        />
        <p className="mt-2 text-xs text-gray-100">
          <i>You&apos;ll then be able to choose an {LLMDisplayName} model in the model dropdown...</i>
        </p>

        <Button
          className="mt-1  h-8 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
          onClick={handleSave}
          placeholder=""
        >
          Save
        </Button>
      </div>
    </ReorModal>
  )
}

const openAIDefaultModels: OpenAILLMConfig[] = [
  {
    contextLength: 128000,
    modelName: 'gpt-4o',
    engine: 'openai',
    type: 'openai',
    apiKey: '',
    apiURL: '',
  },
  {
    contextLength: 16385,
    modelName: 'gpt-3.5-turbo',
    engine: 'openai',
    type: 'openai',
    apiKey: '',
    apiURL: '',
  },
  {
    contextLength: 128000,
    modelName: 'gpt-4-turbo',
    engine: 'openai',
    type: 'openai',
    apiKey: '',
    apiURL: '',
  },
]

const AnthropicDefaultModels: AnthropicLLMConfig[] = [
  {
    contextLength: 180000,
    modelName: 'claude-3-5-sonnet-20240620',
    engine: 'anthropic',
    type: 'anthropic',
    apiKey: '',
    apiURL: '',
  },
]

export default CloudLLMSetupModal
