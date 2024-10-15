/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'

import { EmbeddingModelConfig } from 'electron/main/electron-store/storeConfig'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import NewRemoteEmbeddingModelModal from './modals/NewRemoteEmbeddingModel'

interface InitialEmbeddingModelSettingsProps {
  setErrorMsg: (msg: string) => void
}

const InitialEmbeddingModelSettings: React.FC<InitialEmbeddingModelSettingsProps> = ({ setErrorMsg }) => {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [embeddingModels, setEmbeddingModels] = useState<Record<string, EmbeddingModelConfig>>({})
  const [showNewEmbeddingModelModal, setShowNewEmbeddingModelModal] = useState<boolean>(false)

  const updateEmbeddingModels = async () => {
    const storedEmbeddingModels = await window.electronStore.getEmbeddingModels()

    if (storedEmbeddingModels) {
      setEmbeddingModels(storedEmbeddingModels)
    }

    const defaultModel = await window.electronStore.getDefaultEmbeddingModel()

    if (defaultModel) {
      setSelectedModel(defaultModel)
    }
  }

  useEffect(() => {
    updateEmbeddingModels()
  }, [])

  useEffect(() => {
    if (selectedModel) {
      setErrorMsg('')
    } else {
      setErrorMsg('No embedding model selected')
    }
  }, [selectedModel, setErrorMsg])

  const handleChangeOnModelSelect = (newSelectedModel: string) => {
    setSelectedModel(newSelectedModel)
    window.electronStore.setDefaultEmbeddingModel(newSelectedModel)
  }

  return (
    <div className="flex w-full items-center justify-between rounded bg-dark-gray-c-three">
      <div className="flex flex-col">
        <p className="mb-0 text-gray-100">Embedding Model</p>{' '}
        <p className="text-xs text-gray-400">
          Choose a recommended model or a{' '}
          <a className="underline" onClick={() => setShowNewEmbeddingModelModal(true)}>
            custom embedding model
          </a>
        </p>
      </div>
      <div className="w-[150px]">
        <Select value={selectedModel} onValueChange={handleChangeOnModelSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(embeddingModels).map(([model, config]) => (
              <SelectItem key={model} value={model}>
                <div>
                  <div>{config.readableName}</div>
                  <div className="text-xs text-gray-400">{config.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <NewRemoteEmbeddingModelModal
        isOpen={showNewEmbeddingModelModal}
        onClose={() => {
          setShowNewEmbeddingModelModal(false)
        }}
        handleUserHasChangedModel={() => {
          updateEmbeddingModels()
        }}
      />
    </div>
  )
}

export default InitialEmbeddingModelSettings
