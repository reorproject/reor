import React, { useState } from "react";

import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import { SearchBarWithFilesSuggestion } from "../Generic/SearchBarWithFilesSuggestion";
import { SuggestionsState } from "../Editor/FilesSuggestionsDisplay";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  titleText: string;
  vaultDirectory: string;
  searchText: string;
  setSearchText: (text: string) => void;
  setSelectedFile: (file: string) => void;
  selectedFile: string | null;
  setSuggestionState: (state: SuggestionsState | null) => void;
  onSelectSuggestion: (suggestion: string) => void;
  suggestionsState: SuggestionsState | null;
  setSuggestionsState: (state: SuggestionsState | null) => void;
  maxSuggestionWidth?: string;
}

const AddContextFiltersModal: React.FC<Props> = ({
  vaultDirectory,
  isOpen,
  onClose,
  titleText,
  searchText,
  setSearchText,
  selectedFile,
  setSelectedFile,
  setSuggestionState,
  onSelectSuggestion,
  suggestionsState,
  setSuggestionsState,
  maxSuggestionWidth,
}) => {
  const [internalSuggestionSelected, setInternalSuggestionSelected] = useState<string | null>(null);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-6 w-[900px] h-full">
        <SearchBarWithFilesSuggestion
          vaultDirectory={vaultDirectory}
          titleText={titleText}
          searchText={searchText}
          setSearchText={setSearchText}
          setSelectedFile={setSelectedFile}
          onSelectSuggestion={(suggestion: string) => {
            setSearchText(suggestion);
            setInternalSuggestionSelected(suggestion);
            setSuggestionState(null);
          }}
          suggestionsState={suggestionsState}
          setSuggestionsState={setSuggestionsState}
          maxSuggestionWidth={maxSuggestionWidth}
          />
        <div className="flex justify-end">
          {internalSuggestionSelected && (
            <Button
              className="bg-slate-600 border-none h-20 w-48 text-center vertical-align
                mt-4 mr-16
                cursor-pointer
                disabled:pointer-events-none
                disabled:opacity-25"
              onClick={() => {
                onSelectSuggestion(internalSuggestionSelected)
                onClose();
              }}
              placeholder={""}
            >
              <div className="flex items-center justify-around h-full space-x-2">
                {selectedFile ? "Replace file": "Add file"}
              </div>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddContextFiltersModal;
