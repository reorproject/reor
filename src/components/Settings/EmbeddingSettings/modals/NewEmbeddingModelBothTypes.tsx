import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import { EmbeddingModelWithLocalPath, EmbeddingModelWithRepo } from 'electron/main/electron-store/storeConfig'

import ExternalLink from '../../../Common/ExternalLink'
import ReorModal from '../../../Common/Modal'

interface NewLocalEmbeddingModelModalBothTypesProps {
  isOpen: boolean
  onClose: () => void
  handleUserHasChangedModel?: () => void
}

const NewEmbeddingModelModalBothTypes: React.FC<NewLocalEmbeddingModelModalBothTypesProps> = ({
  isOpen,
  onClose,
  handleUserHasChangedModel,
}) => {
  // const [newModelPath, setNewModelPath] = useState<string>("");
  const [huggingfaceRepo, setHuggingfaceRepo] = useState('')
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false)

  const handleModelDirectorySelection = async () => {
    const paths = await window.fileSystem.openDirectoryDialog()
    if (paths && paths.length > 0) {
      // setNewModelPath(paths[0]);
      const modelObject: EmbeddingModelWithLocalPath = {
        type: 'local',
        localPath: paths[0],
      }

      await window.electronStore.addNewLocalEmbeddingModel(modelObject)
      if (handleUserHasChangedModel) {
        handleUserHasChangedModel()
      }
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // saveModelConfigToElectronStore();
    }
  }

  const handleSaveHuggingFaceRepo = async () => {
    if (!huggingfaceRepo) {
      setIsRepoModalOpen(false)
      return
    }

    const modelObject: EmbeddingModelWithRepo = {
      type: 'repo',
      repoName: huggingfaceRepo,
    }

    await window.electronStore.addNewRepoEmbeddingModel(modelObject)
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel()
    }
    setIsRepoModalOpen(false)
    onClose()
  }

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="mx-2 mb-2 w-[400px] pl-3">
        <h2 className="mb-0  font-semibold text-white">Attach a custom embedding model</h2>
        <p className="my-2 text-sm text-white">
          You can either attach a local embedding model or provide a Hugging Face repo name to be downloaded:
        </p>
        <div className="flex">
          <Button
            className="mr-2 mt-1 h-8 w-[180px] cursor-pointer border-none bg-blue-600 px-2 py-0 text-center hover:bg-blue-600"
            onClick={handleModelDirectorySelection}
            placeholder=""
          >
            Attach Local Model
          </Button>
          <Button
            className="mt-1 h-8 w-[180px] cursor-pointer border-none bg-blue-600 px-2 py-0 text-center hover:bg-blue-600"
            onClick={() => {
              setIsRepoModalOpen(true)
            }}
            placeholder=""
          >
            Download by Repo name
          </Button>
        </div>
        <p className="my-2 text-xs italic text-white">
          <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
            This page on Hugging Face
          </ExternalLink>{' '}
          has most available models. It must be a &quot;Xenova&quot; ONNX embedding model. Check out{' '}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">this guide</ExternalLink> for
          more info.{' '}
        </p>

        <ReorModal
          isOpen={isRepoModalOpen}
          onClose={() => {
            handleSaveHuggingFaceRepo()
          }}
        >
          <div className="mx-2 mb-2 w-[300px] pl-3 pt-1">
            <h3 className="mb-3 font-semibold text-white">Download by Repo name</h3>
            {/* <p className="text-gray-100 mb-3 mt-2 text-sm">
              This will download the embedding model from Hugging Face.
            </p> */}
            <input
              type="text"
              className=" mt-2 box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
              value={huggingfaceRepo}
              onChange={(e) => setHuggingfaceRepo(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Xenova/roberta-base-squad2"
            />
            {/* <p className="text-gray-100 text-xs mb-2 mt-2 italic">
              <ExternalLink
                url="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova"
                label="This page on Hugging Face"
              />{" "}
              has most available models. It must be a &quot;Xenova&quot; ONNX
              embedding model.
            </p> */}
            <Button
              className="mt-3 h-8 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
              onClick={() => {
                if (huggingfaceRepo) handleSaveHuggingFaceRepo()
              }}
              placeholder=""
            >
              Download
            </Button>
          </div>
        </ReorModal>
      </div>
    </ReorModal>
  )
}

export default NewEmbeddingModelModalBothTypes
