import React from 'react'
import { Button } from '@material-tailwind/react'
import ReactCardFlip from 'react-card-flip'
import { Rating, Grade, fsrs } from 'ts-fsrs'
import { toast } from 'react-toastify'

import ProgressBar from './ProgressBar'
import { FlashcardQAPairUI } from './types'
import { storeFlashcardPairAsJSON } from './utils'

interface FlashcardCoreProps {
  flashcardQAPairs: FlashcardQAPairUI[]
  setFlashcardQAPairs: (pairs: FlashcardQAPairUI[]) => void
  currentSelectedFlashcard: number
  setCurrentSelectedFlashcard: (current: number) => void
  selectedFlashcardFile: string
}

const FlashcardCore: React.FC<FlashcardCoreProps> = ({
  flashcardQAPairs,
  setFlashcardQAPairs,
  currentSelectedFlashcard,
  setCurrentSelectedFlashcard,
  selectedFlashcardFile,
}) => {
  const f = fsrs()

  const updateFlashcardUnderReview = (flashcardSelected: number, updatedFlashcard: FlashcardQAPairUI) => {
    const updatedPairs = [...flashcardQAPairs]
    updatedPairs[flashcardSelected] = updatedFlashcard
    setFlashcardQAPairs(updatedPairs)
    
  }

  const handleRating = (rating: Grade) => {
    const currentCard = flashcardQAPairs[currentSelectedFlashcard]
    const now = new Date()


    const result = f.next(currentCard.fsrsState, now, rating)

    const updatedCard: FlashcardQAPairUI = {
      ...currentCard,
      fsrsState: result.card,
    }

    updateFlashcardUnderReview(currentSelectedFlashcard, updatedCard)
    storeFlashcardPairAsJSON(updatedCard, selectedFlashcardFile)

    if (currentSelectedFlashcard < flashcardQAPairs.length - 1) {
      setCurrentSelectedFlashcard(currentSelectedFlashcard + 1)
    } else {
      toast.success('All flashcards reviewed!')
    }
  }

  return (
    flashcardQAPairs.length > 0 && (
      <>
        <ProgressBar completed={currentSelectedFlashcard + 1} total={flashcardQAPairs.length} height="15px" />
        <ReactCardFlip isFlipped={flashcardQAPairs[currentSelectedFlashcard].isFlipped} flipDirection="vertical">
          {/* Front of the card */}
          <Button
            className="mb-2 mt-3 size-full cursor-pointer rounded-md border-none bg-blue-600 text-center text-lg normal-case"
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
          
          {/* Back of the card */}
          {flashcardQAPairs[currentSelectedFlashcard].isFlipped && (
            <div>
              <Button
                className="mb-2 mt-3 size-full cursor-pointer rounded-md border-none bg-slate-700 text-center text-lg normal-case hover:bg-slate-900"
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
              <div className="mt-4 flex justify-around">
                <Button onClick={() => handleRating(Rating.Again)} className="bg-red-500" placeholder="">Again</Button>
                <Button onClick={() => handleRating(Rating.Hard)} className="bg-yellow-500" placeholder="">Hard</Button>
                <Button onClick={() => handleRating(Rating.Good)} className="bg-green-500" placeholder="">Good</Button>
                <Button onClick={() => handleRating(Rating.Easy)} className="bg-blue-500" placeholder="">Easy</Button>
              </div>
            </div>
          )}
        </ReactCardFlip>
      </>
    )
  )
}

export default FlashcardCore
