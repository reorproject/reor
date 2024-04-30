import React, { useState } from "react";

import Modal from "../Generic/Modal";
import { Button, List, ListItem } from "@material-tailwind/react";
import { SearchBarWithFilesSuggestion } from "../Generic/SearchBarWithFilesSuggestion";
import { SuggestionsState } from "../Editor/FilesSuggestionsDisplay";
import { ChatFilters } from "./Chat";
import { ListItemIcon, ListItemText } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  titleText: string;
  vaultDirectory: string;
  setChatFilters: (chatFilters: ChatFilters) => void;
  chatFilters: ChatFilters;
  maxSuggestionWidth?: string;
}

const AddContextFiltersModal: React.FC<Props> = ({
  vaultDirectory,
  isOpen,
  onClose,
  titleText,
  chatFilters,
  setChatFilters,
  maxSuggestionWidth,
}) => {
  const [internalFilesSelected, setInternalFilesSelected] = useState<string[]>(
    chatFilters?.files || []
  );
  const [searchText, setSearchText] = useState<string>("");
  const [suggestionsState, setSuggestionsState] =
    useState<SuggestionsState | null>(null);

  const handleAddFilesToChatFilters = (files: string[]) => {
    const currentChatFilters: ChatFilters = chatFilters
      ? {
          ...chatFilters,
          files: [...chatFilters.files, ...files],
        }
      : {
          numberOfChunksToFetch: 15,
          files: [...files],
        };
    setChatFilters(currentChatFilters);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-6 w-[900px] h-full">
        <SearchBarWithFilesSuggestion
          vaultDirectory={vaultDirectory}
          titleText={titleText}
          searchText={searchText}
          setSearchText={setSearchText}
          onSelectSuggestion={(file: string) => {
            if (file && !internalFilesSelected.includes(file)) {
              //TODO: add markdown extension properly
              setInternalFilesSelected([
                ...internalFilesSelected,
                file + ".md",
              ]);
            }
            setSuggestionsState(null);
          }}
          suggestionsState={suggestionsState}
          setSuggestionsState={setSuggestionsState}
          maxSuggestionWidth={maxSuggestionWidth}
        />
        <div className="text-white">
          <List placeholder="">
            {internalFilesSelected.map((fileItem, index) => {
              return (
                <ListItem key={index} placeholder="">
                  <ListItemIcon>
                    <FolderIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={fileItem} />
                </ListItem>
              );
            })}
          </List>
        </div>
        <div className="flex justify-end">
          {internalFilesSelected && (
            <Button
              className="bg-slate-600 border-none h-20 w-48 text-center vertical-align
                mt-4 mr-16
                cursor-pointer
                disabled:pointer-events-none
                disabled:opacity-25"
              onClick={() => {
                handleAddFilesToChatFilters(internalFilesSelected);
                onClose();
              }}
              placeholder={""}
            >
              <div className="flex items-center justify-around h-full space-x-2">
                Add file
              </div>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddContextFiltersModal;
