import React, { useEffect, useState } from "react";

import Modal from "../Generic/Modal";
import {
  getFlashcardQnaPairsFromJsonFile,
  getFlashcardVaultDirectory,
} from "./utils";
import { FlashcardQAPairUI } from "./types";
import { FlashcardCore } from "./FlashcardsCore";

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
  const [currentSelectedFlashcard, setCurrentSelectedFlashcard] = useState<number>(0);


  useEffect(() => {
    const getFlashcardsFromDirectory = async () => {
      const vaultDirectoryWithFlashcards = await getFlashcardVaultDirectory();
      const files = await window.path.getAllFilenamesInDirectory(
        vaultDirectoryWithFlashcards
      );
      setFlashcardFiles(files);
      setCurrentSelectedFlashcard(0);
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
    };
    readFlashcardJSONForQnAPairs();
  }, [selectedFlashcardFile]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      tailwindStylesOnBackground="bg-gradient-to-r from-orange-900 to-yellow-900"
    >
      <div className="ml-6 mt-2 mb-6 w-full h-full min-w-[900px]">
        <h2 className="text-xl font-semibold mb-3 text-white">
          Flashcard Review Mode
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
        <FlashcardCore
            flashcardQAPairs={flashcardQAPairs}
            setFlashcardQAPairs={setFlashcardQAPairs}
            currentSelectedFlashcard={currentSelectedFlashcard}
            setCurrentSelectedFlashcard={setCurrentSelectedFlashcard}
        />
      </div>
    </Modal>
  );
};

export default FlashcardReviewModal;
