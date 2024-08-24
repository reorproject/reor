import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import { LLMAPIConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import ExternalLink from '../../../Common/ExternalLink'
import ReorModal from '../../../Common/Modal'

import errorToStringRendererProcess from '@/utils/error'

interface RemoteLLMModalProps {
  isOpen: boolean
  onClose: () => void
}

const RemoteLLMSetupModal: React.FC<RemoteLLMModalProps> = ({ isOpen, onClose: parentOnClose }) => {
  const [apiName, setApiName] = useState<string>('')
  const [apiURL, setApiURL] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [currentError, setCurrentError] = useState<string>('')

  const handleSave = async () => {
    const apiConfig: LLMAPIConfig = {
      name: apiName,
      apiInterface: 'openai',
      apiURL,
      apiKey,
    }
    posthog.capture('save_remote_llm', {
      modelName: apiName,
    })
    try {
      await window.llm.addOrUpdateLLMAPIConfig(apiConfig)
      parentOnClose()
    } catch (error) {
      setCurrentError(errorToStringRendererProcess(error))
    }
  }

  const handleClose = () => {
    if (apiName && apiURL) {
      handleSave()
    } else {
      parentOnClose()
    }
  }
  return (
    <ReorModal isOpen={isOpen} onClose={handleClose}>
      <div className="mb-2 ml-3 mr-2 w-[400px]">
        <h2 className="mb-0 font-semibold text-white">Remote LLM Setup</h2>
        <p className="my-2 text-sm text-gray-100">
          Connect with a custom OpenAI-like API endpoint like{' '}
          <ExternalLink href="https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API">
            Oobabooga
          </ExternalLink>
          . A guide to doing this is on the{' '}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/openai-like-api">docs</ExternalLink>. This
          is mainly for folks hosting their own models on other machines.
        </p>

        <h4 className="mb-1 text-gray-100">API URL</h4>

        <input
          type="text"
          placeholder="API URL"
          value={apiURL}
          onChange={(e) => setApiURL(e.target.value)}
          className=" mb-2 box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
        />
        <p className="mt-2 text-xs text-gray-100">
          (This must be an OpenAI compatible API endpoint. That typically is the part of the url before
          /chat/completions like for example http://127.0.0.1:1337/v1)
        </p>
        <h4 className="mb-1 text-gray-100">API Name</h4>
        <input
          type="text"
          placeholder="API Name"
          value={apiName}
          onChange={(e) => setApiName(e.target.value)}
          className=" mb-2 box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
        />
        <p className="mt-2 text-xs text-gray-100">(A name for your new api)</p>

        <h4 className="mb-1 text-gray-100">Optional API Key</h4>
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className=" mb-2 box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
        />
        <p className="mt-2 text-xs text-gray-100">(If your endpoint requires an API key.)</p>

        <div className="flex justify-end pb-2">
          <Button
            className="mt-3 h-8 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={handleSave}
            placeholder=""
          >
            Save
          </Button>
        </div>
        {currentError && <p className="mt-2 text-xs text-red-500">{currentError}</p>}
      </div>
    </ReorModal>
  )
}

export default RemoteLLMSetupModal
