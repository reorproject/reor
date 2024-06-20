import React, { useState, useEffect } from "react";
import Modal from "../Generic/Modal";
import { Button, List, ListItem } from "@material-tailwind/react";
import { SearchBarWithFilesSuggestion } from "../Generic/SearchBarWithFilesSuggestion";
import { SuggestionsState } from "../Editor/FilesSuggestionsDisplay";
import { ChatFilters } from "./Chat";
import { ListItemIcon, ListItemText } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import CustomSelect from "../Generic/Select";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

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
  const [numberOfChunksToFetch, setNumberOfChunksToFetch] = useState<number>(
    chatFilters.numberOfChunksToFetch || 15
  );
  const [minDate, setMinDate] = useState<Date | undefined>(chatFilters.minDate);
  const [maxDate, setMaxDate] = useState<Date | undefined>(chatFilters.maxDate);

  useEffect(() => {
    const loadNumberOfChunks = async () => {
      // Assuming you have a method to get this setting, replace with your actual method
      const storedChunks = await window.electronStore.getNoOfRAGExamples();
      if (storedChunks !== undefined) {
        setNumberOfChunksToFetch(storedChunks);
      }
    };

    loadNumberOfChunks();
  }, []);

  const handleAddFilesToChatFilters = () => {
    window.electronStore.setNoOfRAGExamples(numberOfChunksToFetch); // Assuming this needs to be a number
    const updatedChatFilters: ChatFilters = {
      ...chatFilters,
      files: [...new Set([...chatFilters.files, ...internalFilesSelected])],
      numberOfChunksToFetch: numberOfChunksToFetch,
      minDate: minDate ? minDate : undefined,
      maxDate: maxDate ? maxDate : undefined,
    };
    setChatFilters(updatedChatFilters);
    onClose();
  };

  const handleNumberOfChunksChange = (value: string) => {
    const newNumberOfChunks = parseInt(value, 10); // Convert the string value to an integer
    setNumberOfChunksToFetch(newNumberOfChunks);
  };

  const possibleNoOfExamples = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-6 h-full w-[600px] max-h-[90vh] overflow-y-auto">
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
        <p className="text-white max-w-lg">Select number of notes to draw from:</p>
        <div className="w-full bg-neutral-800 rounded pb-7">
          {numberOfChunksToFetch && (
            <CustomSelect
              options={possibleNoOfExamples.map((num) => ({
                label: num.toString(),
                value: num.toString(),
              }))}
              selectedValue={numberOfChunksToFetch?.toString()}
              onChange={handleNumberOfChunksChange}
            />
          )}
        </div>
        <div className="text-white max-w-lg">
          <p>(Optional) Filter notes by date last modified</p>
        </div>
        <div className="flex space-x-4">
          <div className="text-white max-w-lg flex flex-col items-center">
            <p className="mb-1">Min Date:</p>
            <DayPicker 
              selected={minDate}
              onSelect={(date) => setMinDate(date || undefined)}
              mode="single"
              className="my-day-picker"
            />
          </div>
          <div className="text-white max-w-lg flex flex-col items-center">
            <p className="mb-1">Max Date:</p>
            <DayPicker 
              selected={maxDate}
              onSelect={(date) => setMaxDate(date || undefined)}
              mode="single"
              className="my-day-picker"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            className="bg-slate-600 border-none h-8 w-48 text-center vertical-align
              cursor-pointer
              disabled:pointer-events-none
              disabled:opacity-25"
            onClick={() => {
              handleAddFilesToChatFilters();
              onClose();
            }}
            placeholder={""}
          >
            <div className="flex items-center justify-around h-full space-x-2">
              Update filters
            </div>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddContextFiltersModal;
