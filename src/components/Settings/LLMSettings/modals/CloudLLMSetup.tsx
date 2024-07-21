import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import posthog from 'posthog-js'

import ReorModal from '../../../Common/Modal'
import { AnthropicDefaultModels, openAIDefaultModels } from './utils'

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
    if (openKey) {
      const saveAndUpdateModels = async () => {
        const updatePromises = defaultModels.map(async (modelConfig) => {
          posthog.capture('save_cloud_llm', {
            modelName: modelConfig.modelName,
            llmType: LLMType,
            contextLength: modelConfig.contextLength,
          })

          // Create a new object instead of modifying the parameter
          const updatedConfig = { ...modelConfig, apiKey: openKey }

          await window.llm.addOrUpdateLLM(updatedConfig)
        })

        await Promise.all(updatePromises)
      }

      await saveAndUpdateModels()

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
    <ReorModal isOpen={isOpen} onClose={handleSave} widthType="localLLMSetting">
      <div className="mb-2 ml-3 mr-2 w-[300px]">
        <h3 className="mb-0 font-semibold text-white">{LLMDisplayName} Setup</h3>
        <p className="my-2 text-sm text-gray-100">Enter your {LLMDisplayName} API key below:</p>
        <input
          type="text"
          className=" box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
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

export default CloudLLMSetupModal
