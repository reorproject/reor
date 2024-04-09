import React, { useEffect, useState } from "react";
import { DBResultPreview } from "../File/DBResultPreview";
import { DBQueryResult } from "electron/main/database/Schema";
import { PiGraph } from "react-icons/pi";
import { toast } from "react-toastify";
import { errorToString } from "@/functions/error";
import { FiRefreshCw } from "react-icons/fi";
import { HighlightData } from "../Editor/HighlightExtension";
import ResizableComponent from "../Generic/ResizableComponent";

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

  return (
    <>
      <HighlightButton
        highlightData={highlightData}
        onClick={async () => {
          const databaseFields = await window.database.getDatabaseFields();
          const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`;
          console.log("highlightData", highlightData.text);
          const searchResults: DBQueryResult[] = await window.database.search(
            highlightData.text,
            20,
            filterString
          );
          setSimilarEntries(searchResults);
        }}
      />{" "}
      <ResizableComponent resizeSide="left" initialWidth={400}>
        <SimilarEntriesComponent
          filePath={filePath}
          similarEntries={similarEntries}
          setSimilarEntries={setSimilarEntries}
          onFileSelect={openFileByPath}
          saveCurrentFile={async () => {
            await saveCurrentlyOpenedFile();
          }}
        />
      </ResizableComponent>
    </>
  );
};

export default SidebarComponent;

interface SimilarEntriesComponentProps {
  filePath: string;
  similarEntries: DBQueryResult[];
  setSimilarEntries: (entries: DBQueryResult[]) => void;
  onFileSelect: (path: string) => void;
  saveCurrentFile: () => Promise<void>;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
  similarEntries,
  setSimilarEntries,
  onFileSelect,
  saveCurrentFile,
}) => {
  const [userHitRefresh, setUserHitRefresh] = useState<boolean>(false);

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

  const updateSimilarEntries = async (currentFilePath: string) => {
    const searchResults = await performSearchOnFile(currentFilePath);
    setSimilarEntries(searchResults);
  };

  return (
    <div>
      {/* <HighlightButton
        highlightData={highlightData}
        onClick={() => console.log("clicked this ting")}
      />{" "} */}
      <div
        className={`h-below-titlebar ${
          similarEntries.length > 0 ? "overflow-y-auto" : "overflow-y-hidden"
        } overflow-x-hidden mt-0 border-l-[0.1px] border-t-0 border-b-0 border-r-0 border-gray-600 border-solid`}
      >
        {/* {similarEntries.length > 0 && ( */}
        <div className="flex items-center bg-neutral-800 p-0">
          {/* Invisible Spacer */}
          <div className="flex-1"></div>

          {/* Centered content: PiGraph icon and Related Notes text */}
          <div className="flex items-center justify-center px-4">
            <PiGraph className="text-gray-300 mt-1" />
            <p className="text-gray-300 text-sm pl-1 mb-0 mt-1">
              Related Notes
            </p>
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
            <FiRefreshCw
              className="text-gray-300"
              title="Refresh Related Notes"
            />{" "}
            {/* Icon */}
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
    </div>
  );
};

// export default SimilarEntriesComponent;

interface HighlightButtonProps {
  highlightData: HighlightData;
  onClick: () => void;
}

const HighlightButton: React.FC<HighlightButtonProps> = ({
  highlightData,
  onClick,
}) => {
  if (!highlightData.position) {
    return null;
  }

  const { top, left } = highlightData.position;

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "blue",
    border: "none",
    cursor: "pointer",
    zIndex: "10",
  };

  return <button style={buttonStyle} onClick={onClick} />;
};
