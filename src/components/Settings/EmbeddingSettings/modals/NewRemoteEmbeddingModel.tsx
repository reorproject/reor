import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import { EmbeddingModelWithRepo } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'

import ExternalLink from '../../../Common/ExternalLink'
import ReorModal from '../../../Common/Modal'

interface NewRemoteEmbeddingModelModalProps {
  isOpen: boolean
  onClose: () => void
  handleUserHasChangedModel?: () => void
}

const NewRemoteEmbeddingModelModal: React.FC<NewRemoteEmbeddingModelModalProps> = ({
  isOpen,
  onClose,
  handleUserHasChangedModel,
}) => {
  const [huggingfaceRepo, setHuggingfaceRepo] = useState('')

  const saveModelConfigToElectronStore = async () => {
    if (!huggingfaceRepo) {
      onClose()
      return
    }

    const modelObject: EmbeddingModelWithRepo = {
      type: 'repo',
      repoName: huggingfaceRepo,
    }

    await window.electronStore.addNewRepoEmbeddingModel(modelObject)
    posthog.capture('save_repo_embedding_model', {
      modelRepo: huggingfaceRepo,
    })
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel()
    }
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveModelConfigToElectronStore()
    }
  }

  return (
    <ReorModal isOpen={isOpen} onClose={saveModelConfigToElectronStore}>
      <div className="mx-2 mb-2 w-[400px] pl-3">
        <h2 className="mb-0  font-semibold text-white">Set up remote model</h2>
        <p className="mb-6 mt-2 text-xs text-white">
          Provide the repo name from Hugging Face like &quot;Xenova/roberta-base-squad2&quot;.
        </p>

        <input
          type="text"
          className=" box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={huggingfaceRepo}
          onChange={(e) => setHuggingfaceRepo(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Embedding Model Repo"
        />
        <p className="my-2 text-xs italic text-white">
          <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
            {' '}
            This page on Hugging Face
          </ExternalLink>{' '}
          has most available models. It must be a &quot;Xenova&quot; ONNX embedding model. Check out{' '}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">this guide</ExternalLink> for
          more info.{' '}
        </p>

        <div className="flex w-full justify-end pb-2">
          <Button
            className="mt-3 h-8 w-[120px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={saveModelConfigToElectronStore}
            placeholder=""
          >
            Attach Remote
          </Button>
        </div>
      </div>
    </ReorModal>
  )
}

export default NewRemoteEmbeddingModelModal
