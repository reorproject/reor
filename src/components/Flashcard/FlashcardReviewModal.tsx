import React, { useEffect, useState } from 'react'

import ReorModal from '../Common/Modal'
import CustomSelect from '../Common/Select'

import FlashcardCore from './FlashcardsCore'
import { FlashcardQAPairUI } from './types'
import { getFlashcardQnaPairsFromJsonFile, getFlashcardVaultDirectory } from './utils'

interface FlashcardReviewModalProps {
  isOpen: boolean
  onClose: () => void
}

const FlashcardReviewModal: React.FC<FlashcardReviewModalProps> = ({ isOpen, onClose }) => {
  const [flashcardFiles, setFlashcardFiles] = useState<string[]>([])
  const [selectedFlashcardFile, setSelectedFlashcardFile] = useState<string>('')
  const [flashcardQAPairs, setFlashcardQAPairs] = useState<FlashcardQAPairUI[]>([])
  const [currentSelectedFlashcard, setCurrentSelectedFlashcard] = useState<number>(0)

  useEffect(() => {
    const getFlashcardsFromDirectory = async () => {
      const vaultDirectoryWithFlashcards = await getFlashcardVaultDirectory()
      const files = await window.path.getAllFilenamesInDirectory(vaultDirectoryWithFlashcards)
      setFlashcardFiles(files)
      setCurrentSelectedFlashcard(0)
    }

    getFlashcardsFromDirectory()
  }, [])

  // get flashcards to be reviewed when the file changes
  useEffect(() => {
    const readFlashcardJSONForQnAPairs = async () => {
      const qnaPairs = await getFlashcardQnaPairsFromJsonFile(selectedFlashcardFile)
      setFlashcardQAPairs(qnaPairs)
    }
    readFlashcardJSONForQnAPairs()
  }, [selectedFlashcardFile])

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="mx-6 mb-6 mt-2 h-full w-[800px] flex-col  ">
        <h2 className="mb-3 text-xl font-semibold text-white">Flashcard Review Mode</h2>

        <div className="mb-2 w-full py-2">
          <CustomSelect
            options={flashcardFiles.map((file) => ({
              label: file,
              value: file,
            }))}
            selectedValue={selectedFlashcardFile}
            onChange={(value) => {
              setCurrentSelectedFlashcard(0)
              setSelectedFlashcardFile(value)
            }}
            // className="w-full"
          />
        </div>

        {flashcardQAPairs.length === 0 && <p className="text-xs text-red-500">Choose a set of flashcards</p>}
        <FlashcardCore
          flashcardQAPairs={flashcardQAPairs}
          setFlashcardQAPairs={setFlashcardQAPairs}
          currentSelectedFlashcard={currentSelectedFlashcard}
          setCurrentSelectedFlashcard={setCurrentSelectedFlashcard}
        />
      </div>
    </ReorModal>
  )
}

export default FlashcardReviewModal
