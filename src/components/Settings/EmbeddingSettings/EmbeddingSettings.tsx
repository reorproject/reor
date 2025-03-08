import React, { useState, useEffect } from 'react'

import { EmbeddingModelConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import ChunkSizeSettings from '../ChunkSizeSettings'
import EmbeddingModelSelect from './EmbeddingModelSelect'
import NewRemoteEmbeddingModelModal from './modals/NewRemoteEmbeddingModel'
import { Button } from '@/components/ui/button'
import SettingsSection, { SettingsRow } from '../Shared/SettingsRow'

interface EmbeddingModelManagerProps {
  handleUserHasChangedModel?: () => void
  userTriedToSubmit?: boolean
}

const EmbeddingModelSettings: React.FC<EmbeddingModelManagerProps> = ({
  handleUserHasChangedModel,
  userTriedToSubmit,
}) => {
  const [currentError, setCurrentError] = useState<string>('')
  const [isConextLengthModalOpen, setIsContextLengthModalOpen] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [embeddingModels, setEmbeddingModels] = useState<Record<string, EmbeddingModelConfig>>({})

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
      setCurrentError('')
    } else {
      setCurrentError('No model selected')
    }
  }, [selectedModel])

  const handleChangeOnModelSelect = (newSelectedModel: string) => {
    setSelectedModel(newSelectedModel)
    window.electronStore.setDefaultEmbeddingModel(newSelectedModel)
    posthog.capture('change_default_embedding_model', {
      defaultEmbeddingModel: newSelectedModel,
    })
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel()
    }
  }

  return (
    <SettingsSection
      title="Embedding Model"
      footnote="Note: If you notice some lag in the editor it is likely because you chose too large of an embedding model..."
      error={userTriedToSubmit && !selectedModel ? currentError : ''}
    >
      <SettingsRow
        title="Embedding Model"
        control={
          <EmbeddingModelSelect
            selectedModel={selectedModel}
            embeddingModels={embeddingModels}
            onModelChange={handleChangeOnModelSelect}
          />
        }
      />

      <SettingsRow
        title="Custom Embedding Model"
        description="Reor will download a HuggingFace embedding model for you."
        control={
          <Button variant="secondary" onClick={() => setIsContextLengthModalOpen(true)}>
            Attach
          </Button>
        }
      />

      <SettingsRow
        title="Change Chunk Size"
        description='A larger chunk size means more context is fed to the model at the cost of "needle in a haystack" effects.'
        control={<ChunkSizeSettings />}
        divider={false}
      />

      <NewRemoteEmbeddingModelModal
        isOpen={isConextLengthModalOpen}
        onClose={() => {
          setIsContextLengthModalOpen(false)
        }}
        handleUserHasChangedModel={() => {
          updateEmbeddingModels()
          if (handleUserHasChangedModel) {
            handleUserHasChangedModel()
          }
        }}
      />
    </SettingsSection>
  )
}

export default EmbeddingModelSettings
