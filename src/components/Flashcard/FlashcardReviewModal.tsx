import React, { useEffect, useState } from "react";


import Modal from "../Generic/Modal";
import CustomSelect from "../Generic/Select";

import { FlashcardCore } from "./FlashcardsCore";
import { FlashcardQAPairUI } from "./types";
import {
  getFlashcardQnaPairsFromJsonFile,
  getFlashcardVaultDirectory,
} from "./utils";


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
  const [currentSelectedFlashcard, setCurrentSelectedFlashcard] =
    useState<number>(0);

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-6 w-full h-full w-[900px]">
        <h2 className="text-xl font-semibold mb-3 text-white">
          Flashcard Review Mode
        </h2>

        <div className="py-2 w-[900px]">
          <CustomSelect
            options={flashcardFiles.map((file) => {
              return { label: file, value: file };
            })}
            selectedValue={selectedFlashcardFile}
            onChange={(value) => {
              setCurrentSelectedFlashcard(0);
              setSelectedFlashcardFile(value);
            }}
          />
        </div>

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
