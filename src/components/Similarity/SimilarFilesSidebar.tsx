import React, { useEffect, useState } from "react";
import { DBResultPreview } from "../File/DBResultPreview";
import { DBQueryResult } from "electron/main/database/Schema";
import { PiGraph } from "react-icons/pi";
import { toast } from "react-toastify";
import { errorToString } from "@/functions/error";
import { FiRefreshCw } from "react-icons/fi";
import ResizableComponent from "../Generic/ResizableComponent";
import { HighlightData } from "../Editor/HighlightExtension";
import { FaArrowRight } from "react-icons/fa";
import removeMd from "remove-markdown";
import { CircularProgress } from "@mui/material";

interface SidebarComponentProps {
  filePath: string;
  highlightData: HighlightData;
  openFileByPath: (filePath: string) => void;
  saveCurrentlyOpenedFile: () => Promise<void>;
}

const SidebarComponent: React.FC<SidebarComponentProps> = ({
  filePath,
  highlightData,
  openFileByPath,
  saveCurrentlyOpenedFile,
}) => {
  const [similarEntries, setSimilarEntries] = useState<DBQueryResult[]>([]);
  const [isLoadingSimilarEntries, setIsLoadingSimilarEntries] = useState(false);

  useEffect(() => {
    if (filePath) {
      handleNewFileOpen(filePath);
    }
  }, [filePath]);
  const handleNewFileOpen = async (path: string) => {
    try {
      const searchResults = await performSearchOnFile(path);
      if (searchResults.length > 0) {
        setSimilarEntries(searchResults);
      } else {
        setSimilarEntries([]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const performSearchOnFile = async (
    filePath: string
  ): Promise<DBQueryResult[]> => {
    try {
      const fileContent: string = await window.files.readFile(filePath);
      // TODO: proper semantic chunking here... current quick win is just to take top 500 characters
      if (!fileContent) {
        return [];
      }
      const sanitizedText = removeMd(fileContent.slice(0, 500));

      const databaseFields = await window.database.getDatabaseFields();
      const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`;

      setIsLoadingSimilarEntries(true);
      const searchResults: DBQueryResult[] = await window.database.searchWithReranking(
        sanitizedText,
        20,
        filterString
      );
      setIsLoadingSimilarEntries(false);
      return searchResults;
    } catch (error) {
      console.error("Error:", error);
      toast.error(errorToString(error), {
        className: "mt-5",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
      return [];
    }
  };

  const updateSimilarEntries = async () => {
    const searchResults = await performSearchOnFile(filePath);
    setSimilarEntries(searchResults);
  };

  return (
    <>
      <HighlightButton
        highlightData={highlightData}
        onClick={async () => {
          setSimilarEntries([]);
          const databaseFields = await window.database.getDatabaseFields();
          const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`;
          const searchResults: DBQueryResult[] = await window.database.search(
            highlightData.text,
            20,
            filterString
          );
          setSimilarEntries(searchResults);
        }}
      />{" "}
      <SimilarEntriesComponent
        // filePath={filePath}
        similarEntries={similarEntries}
        setSimilarEntries={setSimilarEntries}
        onFileSelect={openFileByPath}
        saveCurrentFile={async () => {
          await saveCurrentlyOpenedFile();
        }}
        updateSimilarEntries={updateSimilarEntries}
        isLoadingSimilarEntries={isLoadingSimilarEntries}
        titleText="Related Notes"
      />
      {/* </ResizableComponent> */}
    </>
  );
};

export default SidebarComponent;

interface SimilarEntriesComponentProps {
  // filePath: string;
  similarEntries: DBQueryResult[];
  setSimilarEntries?: (entries: DBQueryResult[]) => void;
  onFileSelect: (path: string) => void;
  saveCurrentFile: () => Promise<void>;
  updateSimilarEntries?: () => Promise<void>;
  titleText: string;
  isLoadingSimilarEntries: boolean;
}

export const SimilarEntriesComponent: React.FC<
  SimilarEntriesComponentProps
> = ({
  // filePath,
  similarEntries,
  setSimilarEntries,
  onFileSelect,
  saveCurrentFile,
  updateSimilarEntries,
  titleText,
  isLoadingSimilarEntries,
}) => {

  return (
    <div>
      <ResizableComponent resizeSide="left" initialWidth={300}>
        <div
          className={`h-below-titlebar ${
            similarEntries.length > 0 ? "overflow-y-auto" : "overflow-y-hidden"
          } overflow-x-hidden mt-0 border-l-[0.1px] border-t-0 border-b-0 border-r-0 border-neutral-700  border-solid`}
        >
          {/* {similarEntries.length > 0 && ( */}
          <div className="flex items-center bg-neutral-800 p-0">
            {/* Invisible Spacer */}
            <div className="flex-1"></div>

            <div className="flex items-center justify-center px-4">
              <PiGraph className="text-gray-300 mt-1" />
              <p className="text-gray-300 text-sm pl-1 mb-0 mt-1">
                {titleText}
              </p>
            </div>

            <div className="flex-1 flex justify-end pr-3 pt-1 cursor-pointer">
              {updateSimilarEntries && setSimilarEntries && (
                <div
                  onClick={async () => {
                    setSimilarEntries([]); // simulate refresh
                    await saveCurrentFile();
                    updateSimilarEntries();
                  }}
                >
                  {!isLoadingSimilarEntries && <FiRefreshCw
                    className="text-gray-300"
                    title="Refresh Related Notes"
                  />}
                  {isLoadingSimilarEntries && (
                      <CircularProgress size={24} />
                  )}
                </div>
              )}
            </div>
          </div>
          {similarEntries.length > 0 && (
            <div className="h-full w-full">
              {similarEntries
                .filter((dbResult) => dbResult)
                .map((dbResult, index) => (
                  <div className="pb-2 pr-2 pl-2 pt-1" key={index}>
                    <DBResultPreview
                      key={index}
                      dbResult={dbResult}
                      onSelect={onFileSelect}
                    />
                  </div>
                ))}
            </div>
          )}
          {similarEntries.length === 0 && !isLoadingSimilarEntries && (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <p className="flex justify-center items-center text-gray-500 text-lg mx-auto text-center">
                <>No items found</>
              </p>
            </div>
          )}
        </div>
      </ResizableComponent>
    </div>
  );
};

interface HighlightButtonProps {
  highlightData: HighlightData;
  onClick: () => void;
}
const HighlightButton: React.FC<HighlightButtonProps> = ({
  highlightData,
  onClick,
}) => {
  const [showArrow, setShowArrow] = useState<boolean>(false);

  useEffect(() => {
    // Reset to PiGraph icon when the position becomes undefined (unmounted)
    if (!highlightData.position) {
      setShowArrow(false);
    }
  }, [highlightData.position]);

  if (!highlightData.position) {
    return null;
  }

  const { top, left } = highlightData.position;

  const handleClick = () => {
    onClick(); // This calls the provided onClick handler
    setShowArrow(true); // Show the arrow icon
  };

  return (
    <button
      onClick={handleClick}
      style={{ top: `${top}px`, left: `${left}px` }}
      className="absolute w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer text-white border-none shadow-md hover:bg-gray-300"
      aria-label="Highlight button"
    >
      {showArrow ? (
        <FaArrowRight className="text-gray-800" />
      ) : (
        <PiGraph className="text-gray-800" />
      )}
    </button>
  );
};
