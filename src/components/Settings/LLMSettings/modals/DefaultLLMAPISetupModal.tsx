import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'

import { APIInterface, LLM, LLMAPIConfig } from 'electron/main/electron-store/storeConfig'
import ReorModal from '../../../Common/Modal'

export interface CloudLLMSetupModalProps {
  isOpen: boolean
  onClose: () => void
  apiInterface: APIInterface
  // refreshLLMs?: () => void
}

export const openAIDefaultAPIName = 'OpenAI'
export const anthropicDefaultAPIName = 'Anthropic'

export const openAIDefaultModels: LLM[] = [
  {
    contextLength: 128000,
    modelName: 'gpt-4o',
    apiName: openAIDefaultAPIName,
  },
  {
    contextLength: 128000,
    modelName: 'gpt-4o-mini',
    apiName: openAIDefaultAPIName,
  },
  {
    contextLength: 16385,
    modelName: 'gpt-3.5-turbo',
    apiName: openAIDefaultAPIName,
  },
  {
    contextLength: 128000,
    modelName: 'gpt-4-turbo',
    apiName: openAIDefaultAPIName,
  },
]

export const anthropicDefaultModels: LLM[] = [
  {
    contextLength: 180000,
    modelName: 'claude-3-5-sonnet-20240620',
    apiName: anthropicDefaultAPIName,
  },
]

const DefaultLLMAPISetupModal: React.FC<CloudLLMSetupModalProps> = ({ isOpen, onClose, apiInterface }) => {
  const [apiKey, setAPIKey] = useState('')

  const LLMDisplayName = apiInterface === 'openai' ? 'OpenAI' : 'Anthropic'

  const handleSave = async () => {
    if (apiKey) {
      if (apiInterface === 'openai') {
        const api: LLMAPIConfig = {
          apiKey,
          apiInterface: 'openai',
          name: openAIDefaultAPIName,
        }
        await window.llm.addOrUpdateLLMAPIConfig(api)
        openAIDefaultModels.forEach(async (model) => {
          await window.llm.addOrUpdateLLMConfig(model)
        })
      } else if (apiInterface === 'anthropic') {
        const api: LLMAPIConfig = {
          apiKey,
          apiInterface: 'anthropic',
          name: anthropicDefaultAPIName,
        }
        await window.llm.addOrUpdateLLMAPIConfig(api)
        anthropicDefaultModels.forEach(async (model) => {
          await window.llm.addOrUpdateLLMConfig(model)
        })
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
          className=" box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
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

export default DefaultLLMAPISetupModal
