import React, { useEffect, useState } from "react";
import { TypeAnimation } from 'react-type-animation';

import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import {
  getFlashcardQnaPairsFromJsonFile,
  getFlashcardVaultDirectory,
  storeFlashcardPairsAsJSON,
} from "./utils";
import ReactCardFlip from "react-card-flip";
import { FlashcardQAPair, FlashcardQAPairUI } from "./types";
import ProgressBar from "./ProgressBar";
import { FlashcardCore } from "./FlashcardsCore";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

interface FlashcardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlashcardCreateModal: React.FC<FlashcardCreateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [flashcardQAPairs, setFlashcardQAPairs] = useState<FlashcardQAPairUI[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState<boolean>(false)
  const [currentSelectedFlashcard, setCurrentSelectedFlashcard] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);


  // handle the creation process
  const createFlashcardsFromFile = async(): Promise<void> => {
    // send the file as context to the backend
    const llmName = await window.llm.getDefaultLLMName();
    setIsLoadingFlashcards(true)
    const result = await window.files.generateFlashcardsWithFile({
        prompt: "Generate flashcards as json from this file",
        llmName,
        filePath: selectedFile
      })

    // receive the output as JSON from the backend
    // store the flashcards in memory so that we can render it in flashcardQA pairs
    // and set UI as flipped = false
    const flashcardUIPairs:FlashcardQAPairUI[]  = (JSON.parse(result).flashcards as any[]).map((card) => {return {
      question: card.Q,
      answer: card.A,
      isFlipped: false
    }});
    console.log(result)
    console.log(flashcardUIPairs)
    setFlashcardQAPairs(flashcardUIPairs);
  }

  // find all available files
  useEffect(() => {
    const getAllFiles = async() => {
      const vaultDirectoryWithFlashcards = await window.electronStore.getVaultDirectoryForWindow();
      const files = await window.path.getAllFilenamesInDirectoryRecursively(vaultDirectoryWithFlashcards);
      setAvailableFiles(files)
    }
    getAllFiles();
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      tailwindStylesOnBackground="bg-gradient-to-r from-orange-900 to-yellow-900"
    >
      <div className="ml-6 mt-2 mb-6 w-full h-full min-w-[900px]">
        <h2 className="text-xl font-semibold mb-3 text-white">
          Creating flashcards for: {selectedFile}
        </h2>
        <select
          className="
            block w-full px-3 py-2 mb-2
            border border-gray-300 rounded-md
            focus:outline-none focus:shadow-outline-blue focus:border-blue-300
            transition duration-150 ease-in-out"
          defaultValue=""
          onChange={(event) => {
            setSelectedFile(event.target.value);
          }}
        >
          <option disabled value="">
            {" "}
            -- select one of the files for flashcard generation --{" "}
          </option>

          {availableFiles.map((flashcardFile, index) => {
            return (
              <option value={flashcardFile} key={index}>
                {flashcardFile}
              </option>
            );
          })}
        </select>
        {flashcardQAPairs.length === 0 && (
          <p className="text-red-500 text-xs">Choose a file</p>
        )}
        {isLoadingFlashcards && flashcardQAPairs.length == 0 &&
        <div>
        <TypeAnimation
          className="text-xl font-semibold mb-3 text-white"
          sequence={[
            // Same substring at the start will only be typed out once, initially
            'We are working hard to generate questions',
            500, // wait 0.5 before replacing "question" with "answers"
            'We are working hard to generate answers',
            500,
            'We are working hard to pair questions and answers togetehr',
            500,
            'We should be ready any time now......',
            500,
          ]}
          wrapper="span"
          speed={50}
          />
        </div>}
        <FlashcardCore
            flashcardQAPairs={flashcardQAPairs}
            setFlashcardQAPairs={setFlashcardQAPairs}
            currentSelectedFlashcard={currentSelectedFlashcard}
            setCurrentSelectedFlashcard={setCurrentSelectedFlashcard}
        />
        <div
          className="flex justify-end">
          {flashcardQAPairs.length == 0 && <Button
            className="bg-slate-900/75 border-none h-20 w-96 text-center
            mt-4 mr-16
            cursor-pointer
            disabled:pointer-events-none
            disabled:opacity-25"
            onClick={() => createFlashcardsFromFile()}
            // Write to the flashcards directory if the flashcards generated are valid
            // onClick={async () => await storeFlashcardPairsAsJSON(flashcardQAPairs, fileToGenerateFlashcardsFor)}
            placeholder={""}
            disabled={isLoadingFlashcards}
          >
            {"Generate cards"} {isLoadingFlashcards && <CircularProgress />}

          </Button>}

          {flashcardQAPairs.length > 0 && <Button
            className="bg-orange-900/75 border-none h-20 w-96 text-center
            mt-4 ml-16
            cursor-pointer
            disabled:pointer-events-none
            disabled:opacity-25"
            // Write to the flashcards directory if the flashcards generated are valid
            onClick={async () => await storeFlashcardPairsAsJSON(flashcardQAPairs, selectedFile)}
            placeholder={""}
          >
            {"Save cards"}
          </Button>}
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardCreateModal;
