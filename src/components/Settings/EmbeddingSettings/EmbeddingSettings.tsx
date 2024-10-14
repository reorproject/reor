import React, { useState, useEffect } from 'react'

import { EmbeddingModelConfig } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import CustomSelect from '../../Common/Select'
import ChunkSizeSettings from '../ChunkSizeSettings'

import NewRemoteEmbeddingModelModal from './modals/NewRemoteEmbeddingModel'
import { Button } from '@/components/ui/button'

interface EmbeddingModelManagerProps {
  // userHasCompleted?: (completed: boolean) => void;
  handleUserHasChangedModel?: () => void
  userTriedToSubmit?: boolean
}
const EmbeddingModelSettings: React.FC<EmbeddingModelManagerProps> = ({
  // userHasCompleted,
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

  // TODO: perhaps this can be removed as well...
  useEffect(() => {
    if (selectedModel) {
      if (setCurrentError) {
        setCurrentError('')
      }
    } else if (setCurrentError) {
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
    <div className="flex size-full flex-col justify-between rounded bg-dark-gray-c-three">
      <div>
        <h2 className="mb-0 text-2xl font-semibold text-white">Embedding Model</h2>{' '}
        <div className="mt-2 flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2">
          <div className="flex-col">
            <p className="mt-5 text-gray-100">
              Select Model
              <p className="text-xs text-gray-100">If you change this your files will be re-indexed</p>
            </p>{' '}
          </div>
          <div className="flex items-end">
            {Object.keys(embeddingModels).length > 0 && (
              <CustomSelect
                options={Object.keys(embeddingModels).map((model) => ({
                  label: model,
                  value: model,
                }))}
                selectedValue={selectedModel}
                onChange={handleChangeOnModelSelect}
              />
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2">
          <div className="flex-col">
            <h4 className="mb-0 font-normal text-gray-200">Custom Embedding Model</h4>
            <p className="text-xs text-gray-100">Reor will download a HuggingFace embedding model for you.</p>
          </div>
          <div className="flex">
            <Button variant="secondary" onClick={() => setIsContextLengthModalOpen(true)}>
              Attach
            </Button>
          </div>
        </div>
        <ChunkSizeSettings>
          <div className="flex-col">
            <h4 className="mb-0 font-normal text-gray-200">Change Chunk Size</h4>
            <p className="text-xs text-gray-100">
              A larger chunk size means more context is fed to the model at the cost of &quot;needle in a haystack&quot;
              effects.
            </p>
          </div>
        </ChunkSizeSettings>
      </div>
      {/* Warning message at the bottom */}
      <p className="text-xs text-gray-100 opacity-50">
        <i>
          Note: If you notice some lag in the editor it is likely because you chose too large of an embedding model...
        </i>
      </p>{' '}
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
      {userTriedToSubmit && !selectedModel && <p className="mt-1 text-sm text-red-500">{currentError}</p>}
    </div>
  )
}

export default EmbeddingModelSettings
