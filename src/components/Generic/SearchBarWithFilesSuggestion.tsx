import { useState, useRef, useEffect } from "react";
import { useFileInfoTree } from "../File/FileSideBar/hooks/use-file-info-tree";
import { useFileByFilepath } from "../File/hooks/use-file-by-filepath";
import FilesSuggestionsDisplay, { SuggestionsState } from "../Editor/FilesSuggestionsDisplay";

interface Props {
    vaultDirectory: string;
    titleText: string;
    searchText: string;
    setSearchText: (text: string) => void;
    setSelectedFile: (file: string) => void;
    onSelectSuggestion: (suggestion: string) => void;
    suggestionsState: SuggestionsState | null;
    setSuggestionsState: (state: SuggestionsState) => void;
    maxSuggestionWidth?: string;
}

export const SearchBarWithFilesSuggestion = ({
  vaultDirectory,
  titleText,
  searchText,
  setSearchText,
  setSelectedFile,
  onSelectSuggestion,
  suggestionsState,
  setSuggestionsState,
  maxSuggestionWidth,
  }: Props) => {

  const { flattenedFiles } = useFileInfoTree(vaultDirectory);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializeSuggestionsStateOnFocus = () => {
    const inputCoords = inputRef.current?.getBoundingClientRect();
    if (!inputCoords) {
      return;
    }

    setSuggestionsState({
      position: {
        top: inputCoords.bottom,
        left: inputCoords.x,
      },
      textWithinBrackets: searchText,
      onSelect: (suggestion) => onSelectSuggestion(suggestion),
    });
  };

    return (
        <>
        <h2 className="text-xl font-semibold mb-3 text-white">
        {titleText}
        <input
          ref={inputRef}
          type="text"
          className="block w-full px-3 py-2 mt-6 h-[40px] border border-gray-300 box-border rounded-md
          focus:outline-none focus:shadow-outline-blue focus:border-blue-300
          transition duration-150 ease-in-out"
          value={searchText}
          onSelect={() => initializeSuggestionsStateOnFocus()}
          onChange={(e) => {
            setSearchText(e.target.value)
            if (e.target.value.length == 0) {
              setSelectedFile('')
            }
          }}
          placeholder="Search for the files by name"
        />
        {suggestionsState && (
          <FilesSuggestionsDisplay
            suggestionsState={suggestionsState}
            suggestions={flattenedFiles.map((file) => file.path)}
            maxWidth={maxSuggestionWidth}
          />
        )}
      </h2>
        {!searchText && (
          <p className="text-red-500 text-xs">
          Choose a file by searching or by right clicking a file in directory
          </p>
        )}
        </>
    )
};
