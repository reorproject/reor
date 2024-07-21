import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import posthog from 'posthog-js'
import { BsPencilSquare } from 'react-icons/bs'
import { FaArrowAltCircleRight, FaRegArrowAltCircleRight } from 'react-icons/fa'
import { VscFeedback } from 'react-icons/vsc'

import ReorModal from '../Common/Modal'

import FlashcardCreateModal from './FlashcardCreateModal'
import FlashcardReviewModal from './FlashcardReviewModal'

interface FlashcardMenuModalProps {
  isOpen: boolean
  onClose: () => void
  initialFileToCreateFlashcard?: string
  initialFileToReviewFlashcard?: string
}

const FlashcardMenuModal: React.FC<FlashcardMenuModalProps> = ({
  isOpen,
  onClose,
  initialFileToCreateFlashcard,
  initialFileToReviewFlashcard,
}) => {
  const [isCreateFlashcardMode, setIsCreateFlashcardMode] = useState<boolean>(!!initialFileToCreateFlashcard)
  const [isReviewFlashcardMode, setIsReviewFlashcardMode] = useState<boolean>(!!initialFileToReviewFlashcard)

  return (
    <ReorModal
      isOpen={isOpen}
      onClose={onClose}
      widthType="flashcardMode"
      // tailwindStylesOnBackground="bg-gradient-to-r from-orange-900 to-yellow-900"
    >
      <div className=" mx-6 mb-6 mt-2 size-full flex-col justify-center">
        <h2 className="mb-3 text-center text-xl font-semibold text-white">Flashcard Mode</h2>
        {isReviewFlashcardMode && (
          <FlashcardReviewModal isOpen={isReviewFlashcardMode} onClose={() => setIsReviewFlashcardMode(false)} />
        )}
        {isCreateFlashcardMode && (
          <FlashcardCreateModal
            isOpen={isCreateFlashcardMode}
            onClose={() => setIsCreateFlashcardMode(false)}
            initialFlashcardFile={initialFileToCreateFlashcard}
          />
        )}

        <div className="flex justify-center">
          <Button
            className="mr-4 mt-4 h-60 w-80 cursor-pointer flex-col
              items-center border-none
              bg-distinct-dark-purple
              transition-transform duration-300
              hover:-translate-y-2
              disabled:pointer-events-none
              disabled:opacity-25"
            onClick={() => {
              posthog.capture('open_create_flashcard_mode')
              setIsCreateFlashcardMode(true)
            }}
            // Write to the flashcards directory if the flashcards generated are valid
            // onClick={async () => await storeFlashcardPairsAsJSON(flashcardQAPairs, fileToGenerateFlashcardsFor)}
            placeholder=""
          >
            <BsPencilSquare className="mt-6" size={55} />
            <div className="my-3 text-lg font-bold text-white">Create new flashcards</div>
            <FaArrowAltCircleRight size={35} />
          </Button>

          <Button
            className="ml-4 mt-4 h-60 w-80 cursor-pointer flex-col
              items-center border-none
              bg-moodly-blue
              transition-transform duration-300
              hover:-translate-y-2
              disabled:pointer-events-none
              disabled:opacity-25"
            // Write to the flashcards directory if the flashcards generated are valid
            onClick={async () => {
              posthog.capture('open_review_flashcard_mode')

              setIsReviewFlashcardMode(true)
            }}
            placeholder=""
          >
            <VscFeedback className="mt-6" size={55} />
            <div className="my-3 text-lg font-bold text-white">Review my existing cards</div>
            <FaRegArrowAltCircleRight size={35} />
          </Button>
        </div>
      </div>
    </ReorModal>
  )
}

export default FlashcardMenuModal
