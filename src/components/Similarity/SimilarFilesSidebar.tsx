import React, { useEffect, useState } from "react";
import { DBResultPreview } from "../File/DBResultPreview";
import { DBQueryResult } from "electron/main/database/Schema";
import { PiGraph } from "react-icons/pi";
import { toast } from "react-toastify";
import { errorToString } from "@/functions/error";
import { FiRefreshCw } from "react-icons/fi";

interface SimilarEntriesComponentProps {
  filePath: string;
  onFileSelect: (path: string) => void;
  saveCurrentFile: () => Promise<void>;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
  onFileSelect,
  saveCurrentFile,
}) => {
  const [similarEntries, setSimilarEntries] = useState<DBQueryResult[]>([]);
  const [userHitRefresh, setUserHitRefresh] = useState<boolean>(false);

  const handleNewFileOpen = async (path: string) => {
    try {
      const searchResults = await performSearch(path);
      if (searchResults.length > 0) {
        setSimilarEntries(searchResults);
      } else {
        setSimilarEntries([]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const performSearch = async (filePath: string): Promise<DBQueryResult[]> => {
    try {
      const fileContent: string = await window.files.readFile(filePath);
      // TODO: proper chunking here...
      if (!fileContent) {
        return [];
      }
      const databaseFields = await window.database.getDatabaseFields();
      const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`;

      const searchResults: DBQueryResult[] = await window.database.search(
        fileContent,
        20,
        filterString
      );

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

  useEffect(() => {
    if (filePath) {
      handleNewFileOpen(filePath);
    }

    setUserHitRefresh(false);
  }, [filePath]);

  useEffect(() => {
    let active = true;
    const vectorDBUpdateListener = async () => {
      if (!active) return;
      console.log("Vector DB update listener path: ", filePath);
      updateSimilarEntries(filePath);
    };

    window.ipcRenderer.receive(
      "vector-database-update",
      vectorDBUpdateListener
    );
    return () => {
      active = false;
      window.ipcRenderer.removeListener(
        "vector-database-update",
        vectorDBUpdateListener
      );
    };
  }, [filePath]);

  const updateSimilarEntries = async (currentFilePath: string) => {
    const searchResults = await performSearch(currentFilePath);
    setSimilarEntries(searchResults);
  };

  return (
    <div
      className={`h-below-titlebar ${
        similarEntries.length > 0 ? "overflow-y-auto" : "overflow-y-hidden"
      } overflow-x-hidden mt-0 border-l-[0.1px] border-t-0 border-b-0 border-r-0 border-gray-600 border-solid`}
    >
      {" "}
      {/* {similarEntries.length > 0 && ( */}
      <div className="flex items-center bg-gray-800 p-0">
        {/* Invisible Spacer */}
        <div className="flex-1"></div>

        {/* Centered content: PiGraph icon and Related Notes text */}
        <div className="flex items-center justify-center px-4">
          <PiGraph className="text-gray-300 mt-1" />
          <p className="text-gray-300 text-sm pl-1 mb-0 mt-1">Related Notes</p>
        </div>

        <div
          className="flex-1 flex justify-end pr-3 pt-1 cursor-pointer"
          onClick={async () => {
            setUserHitRefresh(true);
            setSimilarEntries([]); // simulate refresh
            await saveCurrentFile();
            updateSimilarEntries(filePath);
          }}
        >
          <FiRefreshCw className="text-gray-300" title="Refresh Related Notes" /> {/* Icon */}
        </div>
      </div>
      <div className="h-full w-full">
        {similarEntries.map((dbResult, index) => (
          <div className="pb-2 pr-2 pl-2 pt-1" key={index}>
            <DBResultPreview
              key={index}
              dbResult={dbResult}
              onSelect={onFileSelect}
            />
          </div>
        ))}
      </div>
      {similarEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <p className="flex justify-center items-center text-gray-500 text-lg mx-auto text-center">
            {!userHitRefresh ? (
              <>Hit refresh to show related notes...</>
            ) : (
              <>Make sure your note is not empty...</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default SimilarEntriesComponent;
