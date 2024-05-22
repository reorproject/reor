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
}

const AddContextFiltersModal: React.FC<Props> = ({
  vaultDirectory,
  isOpen,
  onClose,
  titleText,
  chatFilters,
  setChatFilters,
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
          files: [...new Set([...chatFilters.files, ...files])],
        }
      : {
          numberOfChunksToFetch: 15,
          files: [...files],
        };
    setChatFilters(currentChatFilters);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-6 h-full w-[600px]">
        <SearchBarWithFilesSuggestion
          vaultDirectory={vaultDirectory}
          titleText={titleText}
          searchText={searchText}
          setSearchText={setSearchText}
          onSelectSuggestion={(file: string) => {
            if (file && !internalFilesSelected.includes(file)) {
              //TODO: add markdown extension properly
              setInternalFilesSelected([...internalFilesSelected, file]);
            }
            setSuggestionsState(null);
          }}
          suggestionsState={suggestionsState}
          setSuggestionsState={setSuggestionsState}
        />
        <div className="text-white max-w-lg">
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
              className="bg-slate-600 border-none h-8 w-48 text-center vertical-align
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
                Add to context
              </div>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddContextFiltersModal;
