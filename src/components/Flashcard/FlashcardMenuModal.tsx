import React, { useState } from "react";

import { Button } from "@material-tailwind/react";
import posthog from "posthog-js";
import { BsPencilSquare } from "react-icons/bs";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { VscFeedback } from "react-icons/vsc";

import ReorModal from "../Common/Modal";

import FlashcardCreateModal from "./FlashcardCreateModal";
import FlashcardReviewModal from "./FlashcardReviewModal";

interface FlashcardMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFileToCreateFlashcard?: string;
  initialFileToReviewFlashcard?: string;
}

const FlashcardMenuModal: React.FC<FlashcardMenuModalProps> = ({
  isOpen,
  onClose,
  initialFileToCreateFlashcard,
  initialFileToReviewFlashcard,
}) => {
  const [isCreateFlashcardMode, setIsCreateFlashcardMode] = useState<boolean>(
    !!initialFileToCreateFlashcard
  );
  const [isReviewFlashcardMode, setIsReviewFlashcardMode] = useState<boolean>(
    !!initialFileToReviewFlashcard
  );

  return (
    <ReorModal
      isOpen={isOpen}
      onClose={onClose}
      width="750px"
      // tailwindStylesOnBackground="bg-gradient-to-r from-orange-900 to-yellow-900"
    >
      <div className="ml-6 mr-6 mt-2 mb-6 w-full h-full flex-col align-center justify-center">
        <h2 className="text-xl font-semibold mb-3 text-white text-center">
          Flashcard Mode
        </h2>
        {isReviewFlashcardMode && (
          <FlashcardReviewModal
            isOpen={isReviewFlashcardMode}
            onClose={() => setIsReviewFlashcardMode(false)}
          />
        )}
        {isCreateFlashcardMode && (
          <FlashcardCreateModal
            isOpen={isCreateFlashcardMode}
            onClose={() => setIsCreateFlashcardMode(false)}
            initialFlashcardFile={initialFileToCreateFlashcard}
          />
        )}

        <div className="flex align-center justify-center">
          <Button
            className="bg-distinct-dark-purple border-none h-60 w-80 items-center flex-col
              mt-4 mr-4
              cursor-pointer
              transition-transform duration-300
              hover:-translate-y-2
              disabled:pointer-events-none
              disabled:opacity-25"
            onClick={() => {
              posthog.capture("open_create_flashcard_mode");
              setIsCreateFlashcardMode(true);
            }}
            // Write to the flashcards directory if the flashcards generated are valid
            // onClick={async () => await storeFlashcardPairsAsJSON(flashcardQAPairs, fileToGenerateFlashcardsFor)}
            placeholder={""}
          >
            <BsPencilSquare className="mt-6" size={55} />
            <div className="text-white font-bold mb-3 mt-3 text-lg">
              Create new flashcards
            </div>
            <FaArrowAltCircleRight size={35} />
          </Button>

          <Button
            className="bg-moodly-blue border-none h-60 w-80 items-center flex-col
              mt-4 ml-4
              cursor-pointer
              transition-transform duration-300
              hover:-translate-y-2
              disabled:pointer-events-none
              disabled:opacity-25"
            // Write to the flashcards directory if the flashcards generated are valid
            onClick={async () => {
              posthog.capture("open_review_flashcard_mode");

              setIsReviewFlashcardMode(true);
            }}
            placeholder={""}
          >
            <VscFeedback className="mt-6" size={55} />
            <div className="text-white font-bold mb-3 mt-3 text-lg">
              Review my existing cards
            </div>
            <FaRegArrowAltCircleRight size={35} />
          </Button>
        </div>
      </div>
    </ReorModal>
  );
};

export default FlashcardMenuModal;
