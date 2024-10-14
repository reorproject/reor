import React, { useState, useEffect } from 'react'

import { EmbeddingModelConfig } from 'electron/main/electron-store/storeConfig'

import CustomSelect from '@/components/Common/Select'
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
      <p className="mb-2 pb-3 text-gray-100">Embedding Model</p>{' '}
      <div className="w-[200px]">
        <CustomSelect
          options={Object.keys(embeddingModels).map((model) => ({
            label: model,
            value: model,
          }))}
          selectedValue={selectedModel}
          onChange={handleChangeOnModelSelect}
          addButton={{
            label: 'Attach a Custom Embedding Model',
            onClick: () => setShowNewEmbeddingModelModal(true),
          }}
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
