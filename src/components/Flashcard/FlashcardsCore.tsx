import React from "react";

import { Button } from "@material-tailwind/react";
import ReactCardFlip from "react-card-flip";

import ProgressBar from "./ProgressBar";
import { FlashcardQAPairUI } from "./types";

interface FlashcardCoreProps {
  flashcardQAPairs: FlashcardQAPairUI[];
  setFlashcardQAPairs: (pairs: FlashcardQAPairUI[]) => void;
  currentSelectedFlashcard: number;
  setCurrentSelectedFlashcard: (current: number) => void;
}

export const FlashcardCore = ({
  flashcardQAPairs,
  setFlashcardQAPairs,
  currentSelectedFlashcard,
  setCurrentSelectedFlashcard,
}: FlashcardCoreProps) => {
  const updateFlashcardUnderReview = (
    flashcardSelected: number,
    updatedFlashcard: FlashcardQAPairUI
  ) => {
    const updatedPairs = [...flashcardQAPairs];
    updatedPairs[flashcardSelected] = updatedFlashcard;
    setFlashcardQAPairs(updatedPairs);
  };

  return (
    <>
      {flashcardQAPairs.length > 0 && (
        <>
          <ProgressBar
            completed={currentSelectedFlashcard + 1}
            total={flashcardQAPairs.length}
            height="15px"
          />
          <ReactCardFlip
            isFlipped={flashcardQAPairs[currentSelectedFlashcard].isFlipped}
            flipDirection="vertical"
          >
            <Button
              className="bg-orange-900  mt-3 mb-2 border-none rounded-md 
            cursor-pointer w-full h-full
            text-center text-lg normal-case"
              onClick={() =>
                updateFlashcardUnderReview(currentSelectedFlashcard, {
                  ...flashcardQAPairs[currentSelectedFlashcard],
                  isFlipped:
                    !flashcardQAPairs[currentSelectedFlashcard].isFlipped,
                })
              }
              placeholder=""
            >
              <div className="text-white opacity-75 resize-y w-full h-64 flex items-center justify-center break-words">
                <p>{flashcardQAPairs[currentSelectedFlashcard].question}</p>
              </div>
            </Button>
            {flashcardQAPairs[currentSelectedFlashcard].isFlipped && ( // this boolean is required to ensure that we check the flipped boolean to prevent the answer from leaking
              <Button
                className="bg-slate-700 mt-3 mb-2 border-none rounded-md 
              hover:bg-slate-900 cursor-pointer w-full h-full
              text-center text-lg normal-case"
                onClick={() =>
                  updateFlashcardUnderReview(currentSelectedFlashcard, {
                    ...flashcardQAPairs[currentSelectedFlashcard],
                    isFlipped:
                      !flashcardQAPairs[currentSelectedFlashcard].isFlipped,
                  })
                }
                placeholder=""
              >
                <div className="text-white resize-y w-full h-64 flex items-center justify-center break-words">
                  <p>{flashcardQAPairs[currentSelectedFlashcard].answer}</p>
                </div>
              </Button>
            )}
          </ReactCardFlip>
          <div className="flex items-center justify-around w-50 mt-6">
            <Button
              className="bg-slate-700 border-none h-10 w-20 text-center
          hover:bg-orange-900 cursor-pointer

          disabled:pointer-events-none
          disabled:opacity-25"
              onClick={() => {
                setCurrentSelectedFlashcard(currentSelectedFlashcard - 1);
              }}
              placeholder={""}
              disabled={currentSelectedFlashcard <= 0}
            >
              {"<"}
            </Button>

            <Button
              className="bg-slate-700 border-none h-10 w-20 text-center
          hover:bg-orange-900 cursor-pointer

          disabled:pointer-events-none
          disabled:opacity-25"
              onClick={() => {
                setCurrentSelectedFlashcard(currentSelectedFlashcard + 1);
              }}
              placeholder={""}
              disabled={currentSelectedFlashcard >= flashcardQAPairs.length - 1}
            >
              {">"}
            </Button>
          </div>
        </>
      )}
    </>
  );
};
