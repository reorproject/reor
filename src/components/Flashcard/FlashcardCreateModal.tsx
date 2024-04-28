import React, { useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";

import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import { storeFlashcardPairsAsJSON } from "./utils";
import { FlashcardQAPairUI } from "./types";
import { FlashcardCore } from "./FlashcardsCore";
import { CircularProgress } from "@mui/material";
import { useFileByFilepath } from "../File/hooks/use-file-by-filepath";
import { SearchBarWithFilesSuggestion } from "../Generic/SearchBarWithFilesSuggestion";

interface FlashcardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFlashcardFile?: string;
}

const FlashcardCreateModal: React.FC<FlashcardCreateModalProps> = ({
  isOpen,
  onClose,
  initialFlashcardFile = "",
}) => {
  const [flashcardQAPairs, setFlashcardQAPairs] = useState<FlashcardQAPairUI[]>(
    []
  );
  const [isLoadingFlashcards, setIsLoadingFlashcards] =
    useState<boolean>(false);
  const [currentSelectedFlashcard, setCurrentSelectedFlashcard] =
    useState<number>(0);
  const [selectedFile, setSelectedFile] =
    useState<string>(initialFlashcardFile);
  // const [availableFiles, setAvailableFiles] = useState<string[]>([]);

  const { suggestionsState, setSuggestionsState } = useFileByFilepath();

  const [searchText, setSearchText] = useState<string>(initialFlashcardFile);
  const [vaultDirectory, setVaultDirectory] = useState<string>("");


  const handleSelectSuggestion = async (suggestion: string) => {
      const suggestionWithExtension =
        await window.path.addExtensionIfNoExtensionPresent(suggestion);
      console.log(suggestionWithExtension);
      setSearchText(suggestionWithExtension);
      setSelectedFile(suggestionWithExtension);
      setFlashcardQAPairs([]);
      setSuggestionsState(null);
  }

  // handle the creation process
  const createFlashcardsFromFile = async (): Promise<void> => {
    // send the file as context to the backend
    const llmName = await window.llm.getDefaultLLMName();
    setIsLoadingFlashcards(true);
    const result = await window.files.generateFlashcardsWithFile({
      prompt: "Generate flashcards as json from this file",
      llmName,
      filePath: selectedFile,
    });

    // receive the output as JSON from the backend
    // store the flashcards in memory so that we can render it in flashcardQA pairs
    // and set UI as flipped = false
    const flashcardUIPairs: FlashcardQAPairUI[] = (
      JSON.parse(result).flashcards as { Q: string; A: string }[]
    ).map((card) => {
      return {
        question: card.Q,
        answer: card.A,
        isFlipped: false,
      };
    });
    setFlashcardQAPairs(flashcardUIPairs);
    setIsLoadingFlashcards(false);

    storeFlashcardPairsAsJSON(flashcardUIPairs, selectedFile);
  };


  // find all available files in the vault directory
  useEffect(() => {
    const setFileDirectory = async () => {
      const windowDirectory =
        await window.electronStore.getVaultDirectoryForWindow();
      setVaultDirectory(windowDirectory);
    };
    setFileDirectory();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-6 w-[900px] h-full">
        <SearchBarWithFilesSuggestion
          vaultDirectory={vaultDirectory}
          titleText="Select a file to generate flashcards for"
          searchText={searchText}
          setSearchText={setSearchText}
          setSelectedFile={setSelectedFile}
          onSelectSuggestion={handleSelectSuggestion}
          suggestionsState={suggestionsState}
          setSuggestionsState={setSuggestionsState}
          maxSuggestionWidth="w-[900px]"
          />
        {isLoadingFlashcards && flashcardQAPairs.length == 0 && (
          <div>
            <TypeAnimation
              className="text-xl font-semibold mb-3 text-white"
              sequence={[
                // Same substring at the start will only be typed out once, initially
                "We are working hard to generate questions",
                500, // wait 0.5 before replacing "question" with "answers"
                "We are working hard to generate answers",
                500,
                "We are working hard to pair questions and answers together",
                500,
                "We should be ready any time now......",
                500,
              ]}
              wrapper="span"
              speed={50}
            />
          </div>
        )}
        <FlashcardCore
          flashcardQAPairs={flashcardQAPairs}
          setFlashcardQAPairs={setFlashcardQAPairs}
          currentSelectedFlashcard={currentSelectedFlashcard}
          setCurrentSelectedFlashcard={setCurrentSelectedFlashcard}
        />
        <div className="flex justify-end">
          {selectedFile && (
            <Button
              className="bg-slate-600 border-none h-20 w-96 text-center vertical-align
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
              <div className="flex items-center justify-around h-full space-x-2">
                {"Generate cards"} {isLoadingFlashcards && <CircularProgress />}
              </div>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FlashcardCreateModal;
