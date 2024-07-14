import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import ExternalLink from '../../../Common/ExternalLink'
import ReorModal from '../../../Common/Modal'
import CustomSelect from '../../../Common/Select'

import { errorToStringRendererProcess } from '@/utils/error'

interface RemoteLLMModalProps {
  isOpen: boolean
  onClose: () => void
}

const contextLengthOptions = [
  { label: '1024', value: '1024' },
  { label: '2048', value: '2048' },
  { label: '4096', value: '4096' },
  { label: '8192', value: '8192' },
  { label: '16384', value: '16384' },
  { label: '32768', value: '32768' },
]

const RemoteLLMSetupModal: React.FC<RemoteLLMModalProps> = ({ isOpen, onClose: parentOnClose }) => {
  const [modelName, setModelName] = useState<string>('')
  const [apiURL, setApiURL] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [selectedContextLength, setSelectedContextLength] = useState(contextLengthOptions[1].value)
  const [currentError, setCurrentError] = useState<string>('')

  const handleSave = async () => {
    const modelConfig: LLMConfig = {
      type: 'openai',
      modelName,
      contextLength: parseInt(selectedContextLength),
      apiURL,
      apiKey,
      engine: 'openai',
    }
    posthog.capture('save_remote_llm', {
      modelName,
      contextLength: selectedContextLength,
    })
    try {
      await window.llm.addOrUpdateLLM(modelConfig)
      parentOnClose()
    } catch (error) {
      console.error('Failed to save remote model configuration:', error)
      setCurrentError(errorToStringRendererProcess(error))
    }
  }

  const handleClose = () => {
    if (modelName && apiURL) {
      handleSave()
    } else {
      parentOnClose()
    }
  }
  return (
    <ReorModal isOpen={isOpen} onClose={handleClose}>
      <div className="w-[400px] ml-3 mr-2 mb-2">
        <h2 className="font-semibold mb-0 text-white">Remote LLM Setup</h2>
        <p className="text-gray-100 mb-2 mt-2 text-sm">
          Connect with a custom OpenAI-like API endpoint like{' '}
          <ExternalLink href="https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API">
            Oobabooga
          </ExternalLink>
          . A guide to doing this is on the{' '}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/openai-like-api">docs</ExternalLink>.
        </p>

        <h4 className="text-gray-100 mb-1">API URL</h4>
        {/* Forc */}
        <input
          type="text"
          placeholder="API URL"
          value={apiURL}
          onChange={(e) => setApiURL(e.target.value)}
          className="block w-full px-3 py-2 mb-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
        />
        <p className="mt-2 text-gray-100 text-xs">
          (This must be an OpenAI compatible API endpoint. That typically is the part of the url before
          /chat/completions like for example http://127.0.0.1:1337/v1)
        </p>
        <h4 className="text-gray-100 mb-1">Model Name</h4>
        <input
          type="text"
          placeholder="Model Name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="block w-full px-3 py-2 mb-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
        />
        <p className="mt-2 text-gray-100 text-xs">(Model alias like &quot;gpt-3.5-turbo-1106&quot;)</p>

        <h4 className="text-gray-100 mb-1">Optional API Key</h4>
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="block w-full px-3 py-2 mb-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
        />
        <p className="mt-2 text-gray-100 text-xs">(If your endpoint requires an API key.)</p>
        <h4 className="text-gray-100 mb-1">Context Length</h4>
        <CustomSelect
          options={contextLengthOptions}
          selectedValue={selectedContextLength}
          onChange={(newValue) => {
            setSelectedContextLength(newValue)
          }}
        />

        <div className="pb-2 flex justify-end">
          <Button
            className="bg-blue-500 border-none h-8 hover:bg-blue-600 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mt-3 w-[80px]"
            onClick={handleSave}
            placeholder=""
          >
            Save
          </Button>
        </div>
        {currentError && <p className="text-xs text-red-500 mt-2">{currentError}</p>}
      </div>
    </ReorModal>
  )
}

export default RemoteLLMSetupModal
