/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'

import { EmbeddingModelConfig } from 'electron/main/electron-store/storeConfig'

import NewRemoteEmbeddingModelModal from './modals/NewRemoteEmbeddingModel'
import EmbeddingModelSelect from './EmbeddingModelSelect'

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
        <EmbeddingModelSelect
          selectedModel={selectedModel}
          embeddingModels={embeddingModels}
          onModelChange={handleChangeOnModelSelect}
        />
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
