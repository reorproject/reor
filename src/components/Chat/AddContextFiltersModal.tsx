import React, { useState, useEffect } from "react";

import { List, ListItem } from "@material-tailwind/react";
import FolderIcon from "@mui/icons-material/Folder";
import { ListItemIcon, ListItemText } from "@mui/material";
import Slider from "@mui/material/Slider";
import { sub } from "date-fns";
import posthog from "posthog-js";
import { DayPicker } from "react-day-picker";

import { SuggestionsState } from "../Editor/FilesSuggestionsDisplay";
import "react-day-picker/dist/style.css";
import Modal from "../Generic/Modal";
import { SearchBarWithFilesSuggestion } from "../Generic/SearchBarWithFilesSuggestion";
import CustomSelect from "../Generic/Select";

import { ChatFilters } from "./Chat";

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
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("Anytime");

  const dateRangeOptions = [
    { label: "Anytime", value: "anytime" },
    { label: "Past hour", value: "lastHour" },
    { label: "Past 24 hours", value: "lastDay" },
    { label: "Past week", value: "lastWeek" },
    { label: "Past month", value: "lastMonth" },
    { label: "Past year", value: "lastYear" },
  ];

  useEffect(() => {
    const loadNumberOfChunks = async () => {
      const storedChunks = await window.electronStore.getNoOfRAGExamples();
      if (storedChunks !== undefined) {
        setNumberOfChunksToFetch(storedChunks);
      }
    };

    loadNumberOfChunks();
  }, []);

  useEffect(() => {
    const updatedChatFilters: ChatFilters = {
      ...chatFilters,
      files: [...new Set([...chatFilters.files, ...internalFilesSelected])],
      numberOfChunksToFetch: numberOfChunksToFetch,
      minDate: minDate ? minDate : undefined,
      maxDate: maxDate ? maxDate : undefined,
    };
    setChatFilters(updatedChatFilters);
  }, [internalFilesSelected, numberOfChunksToFetch, minDate, maxDate]);

  const handleNumberOfChunksChange = (
    event: Event,
    value: number | number[]
  ) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    setNumberOfChunksToFetch(newValue);
    posthog.capture("change_number_of_chunks_to_search_for_context");
  };

  const handleDateRangeChange = (value: string) => {
    const now = new Date();
    let newMinDate: Date | undefined;
    switch (value) {
      case "anytime":
        newMinDate = undefined;
        break;
      case "lastHour":
        newMinDate = sub(now, { hours: 1 });
        break;
      case "lastDay":
        newMinDate = sub(now, { days: 1 });
        break;
      case "lastWeek":
        newMinDate = sub(now, { weeks: 1 });
        break;
      case "lastMonth":
        newMinDate = sub(now, { months: 1 });
        break;
      case "lastYear":
        newMinDate = sub(now, { years: 1 });
        break;
      default:
        newMinDate = undefined;
    }
    setMinDate(newMinDate);
    setMaxDate(value === "anytime" ? undefined : now);
    setSelectedDateRange(
      dateRangeOptions.find((option) => option.value === value)?.label || ""
    );
  };

  const handleAdvancedToggle = () => {
    setShowAdvanced(!showAdvanced);
  };

  // Define the marks to be closer together
  const marks = Array.from({ length: 31 }, (_, i) => ({
    value: i,
    label: i % 5 === 0 ? i.toString() : "", // Show label every 5 steps
  }));

  useEffect(() => {
    console.log("chatFilters updated:", chatFilters);
  }, [chatFilters]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-6 mt-2 mb-6 h-full w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <h2 className="text-white text-2xl mb-4">{titleText}</h2>
        <p className="text-white">Select notes to include in context:</p>
        <SearchBarWithFilesSuggestion
          vaultDirectory={vaultDirectory}
          searchText={searchText}
          setSearchText={setSearchText}
          onSelectSuggestion={(file: string) => {
            if (file && !internalFilesSelected.includes(file)) {
              setInternalFilesSelected([...internalFilesSelected, file]);
            }
            setSuggestionsState(null);
          }}
          suggestionsState={suggestionsState}
          setSuggestionsState={setSuggestionsState}
        />
        <div className="text-white w-full">
          <List placeholder="">
            {internalFilesSelected.map((fileItem, index) => (
              <ListItem key={index} placeholder="">
                <ListItemIcon>
                  <FolderIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={fileItem} />
              </ListItem>
            ))}
          </List>
        </div>
        <p className="text-white w-full">
          Number of notes to fetch for context:
        </p>
        <div className="w-full bg-neutral-800 rounded pb-3 max-w-xl mx-auto">
          <Slider
            aria-label="Number of Notes"
            value={numberOfChunksToFetch}
            valueLabelDisplay="on"
            step={1}
            marks={marks}
            min={0}
            max={30}
            onChange={handleNumberOfChunksChange}
            sx={{
              "& .MuiSlider-thumb": {
                "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                  boxShadow: "none",
                },
                "&::after": {
                  content: "none",
                },
              },
              "& .MuiSlider-valueLabel": {
                fontSize: "0.75rem",
                padding: "3px 6px",
                lineHeight: "1.2em",
              },
              "& .MuiSlider-markLabel": {
                color: "#FFFFFF",
              },
              "& .MuiSlider-mark": {
                color: "#FFFFFF",
              },
            }}
          />
        </div>
        <div className="text-white mb-7 text-center">
          {numberOfChunksToFetch}
        </div>
        <div className="text-white max-w-lg">
          <p>Filter by last modified date:</p>
        </div>
        {!showAdvanced && (
          <div className="w-full  rounded pb-1">
            <CustomSelect
              options={dateRangeOptions}
              selectedValue={selectedDateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        )}
        <div>
          <div
            className="text-gray-500 text-xs underline cursor-pointer"
            onClick={handleAdvancedToggle}
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </div>
          {showAdvanced && (
            <div className="flex space-x-4 mt-4 w-full">
              <div className="text-white flex-1 flex flex-col items-center">
                <p className="mb-1">Min Date:</p>
                <DayPicker
                  selected={minDate}
                  onSelect={(date) => setMinDate(date || undefined)}
                  mode="single"
                  className="my-day-picker w-full"
                />
              </div>
              <div className="text-white flex-1 flex flex-col items-center">
                <p className="mb-1">Max Date:</p>
                <DayPicker
                  selected={maxDate}
                  onSelect={(date) => setMaxDate(date || undefined)}
                  mode="single"
                  className="my-day-picker w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddContextFiltersModal;
