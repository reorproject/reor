/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react'
import { LLMAPIConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import ExternalLink from '../../../Common/ExternalLink'
import errorToStringRendererProcess from '@/lib/error'

interface RemoteLLMModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ModelNameInputProps {
  modelNames: string[]
  setModelNames: React.Dispatch<React.SetStateAction<string[]>>
}

const ModelNameInput: React.FC<ModelNameInputProps> = ({ modelNames, setModelNames }) => {
  const [newModelName, setNewModelName] = useState('')

  const addModelName = () => {
    if (newModelName.trim() !== '') {
      setModelNames([...modelNames, newModelName.trim()])
      setNewModelName('')
    }
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Model Names</h4>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Add model name"
          value={newModelName}
          onChange={(e) => setNewModelName(e.target.value)}
        />
        <Button onClick={addModelName} type="button" variant="secondary">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {modelNames.map((name, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index} className="rounded bg-secondary px-2 py-1 text-sm">
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

const CustomLLMAPISetupModal: React.FC<RemoteLLMModalProps> = ({ isOpen, onClose: parentOnClose }) => {
  const [apiName, setApiName] = useState<string>('')
  const [apiURL, setApiURL] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [modelNames, setModelNames] = useState<string[]>([])
  const [currentError, setCurrentError] = useState<string>('')

  const handleSave = async () => {
    if (!apiName || !apiURL) {
      setCurrentError('API Name and URL are required')
      return
    }
    const apiConfig: LLMAPIConfig = {
      name: apiName,
      apiInterface: 'openai',
      apiURL,
      apiKey,
    }
    posthog.capture('save_remote_llm', {
      modelName: apiName,
      modelCount: modelNames.length,
    })
    try {
      await window.llm.addOrUpdateLLMAPIConfig(apiConfig)
      modelNames.forEach(async (modelName) => {
        await window.llm.addOrUpdateLLMConfig({
          modelName,
          apiName,
        })
      })
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Remote LLM Setup</DialogTitle>
          <DialogDescription>
            Connect with a custom OpenAI-like API endpoint like{' '}
            <ExternalLink href="https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API">
              Oobabooga
            </ExternalLink>
            . A guide to doing this is on the{' '}
            <ExternalLink href="https://www.reorproject.org/docs/documentation/openai-like-api">docs</ExternalLink>.
            This is mainly for folks hosting their own models on other machines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="apiUrl">API URL</label>
            <Input
              id="apiUrl"
              type="text"
              placeholder="API URL"
              value={apiURL}
              onChange={(e) => setApiURL(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              (This must be an OpenAI compatible API endpoint. That typically is the part of the url before
              /chat/completions like for example http://127.0.0.1:1337/v1)
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="apiName">API Name</label>
            <Input
              id="apiName"
              type="text"
              placeholder="API Name"
              value={apiName}
              onChange={(e) => setApiName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">(A name for your new api)</p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="apiKey">Optional API Key</label>
            <Input
              id="apiKey"
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">(If your endpoint requires an API key.)</p>
          </div>
          <ModelNameInput modelNames={modelNames} setModelNames={setModelNames} />
          {currentError && <p className="text-xs text-destructive">{currentError}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomLLMAPISetupModal
