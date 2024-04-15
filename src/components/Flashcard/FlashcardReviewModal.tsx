import React, { useEffect, useState } from "react";

import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import {
  getFlashcardQnaPairsFromJsonFile,
  getFlashcardVaultDirectory,
} from ".";
import ReactCardFlip from "react-card-flip";
import { FlashcardQAPairUI } from "./types";
import ProgressBar from "./ProgressBar";

interface FlashcardReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlashcardReviewModal: React.FC<FlashcardReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [flashcardFiles, setFlashcardFiles] = useState<string[]>([]);
  const [selectedFlashcardFile, setSelectedFlashcardFile] =
    useState<string>("");
  const [flashcardQAPairs, setFlashcardQAPairs] = useState<FlashcardQAPairUI[]>(
    []
  );

  //unit flashcard
  const [currentSelectedFlashcard, setSelectedFlashcard] = useState<number>(0);

  // store the state of review TODO
  const updateFlashcardUnderReview = (
    flashcardSelected: number,
    updatedFlashcard: FlashcardQAPairUI
  ) => {
    const updatedPairs = [...flashcardQAPairs];
    updatedPairs[flashcardSelected] = updatedFlashcard;
    setFlashcardQAPairs(updatedPairs);
  };

  useEffect(() => {
    const getFlashcardsFromDirectory = async () => {
      const vaultDirectoryWithFlashcards = await getFlashcardVaultDirectory();
      const files = await window.path.getAllFilenamesInDirectory(
        vaultDirectoryWithFlashcards
      );
      setFlashcardFiles(files);
    };

    getFlashcardsFromDirectory();
  }, []);

  //get flashcards to be reviewed when the file changes
  useEffect(() => {
    const readFlashcardJSONForQnAPairs = async () => {
      const qnaPairs = await getFlashcardQnaPairsFromJsonFile(
        selectedFlashcardFile
      );
      setFlashcardQAPairs(qnaPairs);
      setSelectedFlashcard(0);
    };
    readFlashcardJSONForQnAPairs();
  }, [selectedFlashcardFile]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      tailwindStylesOnBackground="bg-gradient-to-r from-orange-900 to-yellow-900"
    >
      <div className="ml-6 mt-2 mb-6 w-full h-full min-w-[800px]">
        <h2 className="text-xl font-semibold mb-3 text-white">
          Start reviewing your flashcards
        </h2>

        <select
          className="
            block w-full px-3 py-2 mb-2  
            border border-gray-300 rounded-md 
            focus:outline-none focus:shadow-outline-blue focus:border-blue-300 
            transition duration-150 ease-in-out"
          defaultValue=""
          onChange={(event) => {
            setSelectedFlashcardFile(event.target.value);
          }}
        >
          <option disabled value="">
            {" "}
            -- select one of the flashcard sets --{" "}
          </option>

          {flashcardFiles.map((flashcardFile, index) => {
            return (
              <option value={flashcardFile} key={index}>
                {flashcardFile}
              </option>
            );
          })}
        </select>

        {flashcardQAPairs.length === 0 && (
          <p className="text-red-500 text-xs">Choose a set of flashcards</p>
        )}
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
                className="bg-orange-900  mt-3 mb-2 border-none rounded-md h-10 
              cursor-pointer w-[800px] h-full 
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
                  className="bg-slate-700 mt-3 mb-2 border-none rounded-md h-10 
                hover:bg-slate-900 cursor-pointer w-[800px] h-full 
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
                    <text>
                      {flashcardQAPairs[currentSelectedFlashcard].answer}
                    </text>
                  </div>
                </Button>
              )}
            </ReactCardFlip>
          </>
        )}
        <div className="flex items-center justify-around w-50 mt-6">
          <Button
            className="bg-slate-700 border-none h-10 w-20 text-center
            hover:bg-orange-900 cursor-pointer

            disabled:pointer-events-none
            disabled:opacity-25"
            onClick={() => {
              setSelectedFlashcard(currentSelectedFlashcard - 1);
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
              setSelectedFlashcard(currentSelectedFlashcard + 1);
            }}
            placeholder={""}
            disabled={currentSelectedFlashcard >= flashcardQAPairs.length - 1}
          >
            {">"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardReviewModal;
