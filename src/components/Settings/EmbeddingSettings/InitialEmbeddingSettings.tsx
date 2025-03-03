/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'

import { EmbeddingModelConfig } from 'electron/main/electron-store/storeConfig'
import { XStack, YStack, SizableText } from 'tamagui'

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
    <XStack width="100%">
      <YStack flex={1}>
        <SizableText color="$gray13" fontWeight={600} fontSize={16}>
          Embedding Model
        </SizableText>
        <SizableText color="$black" fontSize={12} fontWeight={300} marginTop="$2">
          Choose a recommended model or a{' '}
          <a className="underline" onClick={() => setShowNewEmbeddingModelModal(true)}>
            custom embedding model
          </a>
        </SizableText>
      </YStack>
      <YStack>
        <EmbeddingModelSelect
          selectedModel={selectedModel}
          embeddingModels={embeddingModels}
          onModelChange={handleChangeOnModelSelect}
        />
      </YStack>

      <NewRemoteEmbeddingModelModal
        isOpen={showNewEmbeddingModelModal}
        onClose={() => {
          setShowNewEmbeddingModelModal(false)
        }}
        handleUserHasChangedModel={() => {
          updateEmbeddingModels()
        }}
      />
    </XStack>
  )
}

export default InitialEmbeddingModelSettings
