import React, { useEffect, useState } from "react";

import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import {
  getFlashcardQnaPairsFromJsonFile,
  getFlashcardVaultDirectory,
} from ".";
import ReactCardFlip from "react-card-flip";
import { FlashcardQAPairUI } from "./types";

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-2 h-full min-w-[400px]">
        <h2 className="text-xl font-semibold mb-3 text-white">
          Select your flashcards
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
            -- select an option --{" "}
          </option>

          {flashcardFiles.map((flashcardFile, index) => {
            return (
              <option value={flashcardFile} key={index}>
                {flashcardFile}
              </option>
            );
          })}
        </select>

        {flashcardQAPairs.length > 0 && (
          <ReactCardFlip
            isFlipped={flashcardQAPairs[currentSelectedFlashcard].isFlipped}
            flipDirection="vertical"
          >
            <button
              className="bg-orange-700 mt-3 mb-2 border-none rounded-md h-10 
              hover:bg-orange-900 cursor-pointer w-full h-full 
              text-center text-lg"
              onClick={() =>
                updateFlashcardUnderReview(currentSelectedFlashcard, {
                  ...flashcardQAPairs[currentSelectedFlashcard],
                  isFlipped:
                    !flashcardQAPairs[currentSelectedFlashcard].isFlipped,
                })
              }
            >
              <div className="text-white resize-y w-full h-64 flex items-center justify-center">
                <p>{flashcardQAPairs[currentSelectedFlashcard].question}</p>
              </div>
            </button>
            {flashcardQAPairs[currentSelectedFlashcard].isFlipped && ( // this boolean is required to ensure that we check the flipped boolean to prevent the answer from leaking
              <button
                className="bg-slate-700 mt-3 mb-2 border-none rounded-md h-10 
                hover:bg-orange-900 cursor-pointer w-full h-full 
                text-center text-lg"
                onClick={() =>
                  updateFlashcardUnderReview(currentSelectedFlashcard, {
                    ...flashcardQAPairs[currentSelectedFlashcard],
                    isFlipped:
                      !flashcardQAPairs[currentSelectedFlashcard].isFlipped,
                  })
                }
              >
                <div className="text-white resize-y w-full h-64 flex items-center justify-center">
                  <p>{flashcardQAPairs[currentSelectedFlashcard].answer}</p>
                </div>
              </button>
            )}
          </ReactCardFlip>
        )}
        <div className="flex items-center justify-around w-50">
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
        <Button
          className="bg-neutral-300 mt-3 mb-2 border-none h-10 bg-opacity-50
          hover:bg-orange-900 hover:text-white cursor-pointer w-[180px] text-center pt-0 pb-0 pr-2 pl-2 text-orange-900"
          onClick={() => console.log("done reviewing")} // write the reviewed files into the progress log
          placeholder={""}
        >
          Save progress
        </Button>
        {/* {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>} */}
      </div>
    </Modal>
  );
};

export default FlashcardReviewModal;
