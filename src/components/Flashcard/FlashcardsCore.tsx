import React from 'react'

import { Button } from '@material-tailwind/react'
import ReactCardFlip from 'react-card-flip'

import ProgressBar from './ProgressBar'
import { FlashcardQAPairUI } from './types'

interface FlashcardCoreProps {
  flashcardQAPairs: FlashcardQAPairUI[]
  setFlashcardQAPairs: (pairs: FlashcardQAPairUI[]) => void
  currentSelectedFlashcard: number
  setCurrentSelectedFlashcard: (current: number) => void
}

const FlashcardCore: React.FC<FlashcardCoreProps> = ({
  flashcardQAPairs,
  setFlashcardQAPairs,
  currentSelectedFlashcard,
  setCurrentSelectedFlashcard,
}) => {
  const updateFlashcardUnderReview = (flashcardSelected: number, updatedFlashcard: FlashcardQAPairUI) => {
    const updatedPairs = [...flashcardQAPairs]
    updatedPairs[flashcardSelected] = updatedFlashcard
    setFlashcardQAPairs(updatedPairs)
  }

  return (
    flashcardQAPairs.length > 0 && (
      <>
        <ProgressBar completed={currentSelectedFlashcard + 1} total={flashcardQAPairs.length} height="15px" />
        <ReactCardFlip isFlipped={flashcardQAPairs[currentSelectedFlashcard].isFlipped} flipDirection="vertical">
          <Button
            className="mb-2  mt-3 size-full cursor-pointer rounded-md
            border-none bg-blue-600 text-center
            text-lg normal-case"
            onClick={() =>
              updateFlashcardUnderReview(currentSelectedFlashcard, {
                ...flashcardQAPairs[currentSelectedFlashcard],
                isFlipped: !flashcardQAPairs[currentSelectedFlashcard].isFlipped,
              })
            }
            placeholder=""
          >
            <div className="flex h-64 w-full resize-y items-center justify-center break-words text-white opacity-75">
              <p>{flashcardQAPairs[currentSelectedFlashcard].question}</p>
            </div>
          </Button>
          {flashcardQAPairs[currentSelectedFlashcard].isFlipped && ( // this boolean is required to ensure that we check the flipped boolean to prevent the answer from leaking
            <Button
              className="mb-2 mt-3 size-full cursor-pointer rounded-md
              border-none bg-slate-700 text-center text-lg
              normal-case hover:bg-slate-900"
              onClick={() =>
                updateFlashcardUnderReview(currentSelectedFlashcard, {
                  ...flashcardQAPairs[currentSelectedFlashcard],
                  isFlipped: !flashcardQAPairs[currentSelectedFlashcard].isFlipped,
                })
              }
              placeholder=""
            >
              <div className="flex h-64 w-full resize-y items-center justify-center break-words text-white">
                <p>{flashcardQAPairs[currentSelectedFlashcard].answer}</p>
              </div>
            </Button>
          )}
        </ReactCardFlip>
        <div className="mt-6 flex items-center justify-around">
          <Button
            className="h-10 w-20 cursor-pointer border-none bg-slate-700
          text-center hover:bg-blue-600

          disabled:pointer-events-none
          disabled:opacity-25"
            onClick={() => {
              setCurrentSelectedFlashcard(currentSelectedFlashcard - 1)
            }}
            placeholder=""
            disabled={currentSelectedFlashcard <= 0}
          >
            {'<'}
          </Button>

          <Button
            className="h-10 w-20 cursor-pointer border-none bg-slate-700
          text-center hover:bg-blue-600

          disabled:pointer-events-none
          disabled:opacity-25"
            onClick={() => {
              setCurrentSelectedFlashcard(currentSelectedFlashcard + 1)
            }}
            placeholder=""
            disabled={currentSelectedFlashcard >= flashcardQAPairs.length - 1}
          >
            {'>'}
          </Button>
        </div>
      </>
    )
  )
}

export default FlashcardCore
