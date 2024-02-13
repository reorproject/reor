import React, { useEffect, useState } from "react";
import { DBResultPreview } from "../File/DBResultPreview";
import { DBQueryResult } from "electron/main/database/Schema";
import { PiGraph } from "react-icons/pi";

interface SimilarEntriesComponentProps {
  filePath: string;
  onFileSelect: (path: string) => void;
  windowVaultDirectory: string;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
  onFileSelect,
  windowVaultDirectory,
}) => {
  const [similarEntries, setSimilarEntries] = useState<DBQueryResult[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);

  const handleNewFileOpen = async (path: string) => {
    setLoading(true);
    try {
      const searchResults = await performSearch(path, windowVaultDirectory);
      if (searchResults.length > 0) {
        setSimilarEntries(searchResults);
      } else {
        setSimilarEntries([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (
    filePath: string,
    windowVaultDirectory: string
  ): Promise<DBQueryResult[]> => {
    const fileContent: string = await window.files.readFile(filePath);
    // Ok so that wouldn't be too hard to do here: chunk the ting and just perform a search based on the chunks.
    // And in fact, it's probably slightly wasteful to be doing all these embeddings
    // We already have the embeddings so should just leverage the backend to show related files, leverage the embeddings we already have.
    if (!fileContent) {
      console.error("File content is empty");
      return [];
    }
    const databaseFields = await window.database.getDatabaseFields();
    const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`;
    const searchResults: DBQueryResult[] = await window.database.search(
      fileContent,
      30,
      windowVaultDirectory,
      filterString
    );
    return searchResults;
  };

  useEffect(() => {
    if (filePath) {
      handleNewFileOpen(filePath);
    }
  }, [filePath]);

  useEffect(() => {
    const vectorDBUpdateListener = async () => {
      const searchResults = await performSearch(filePath, windowVaultDirectory);
      if (searchResults.length > 0) {
        setSimilarEntries(searchResults);
      }
    };

    window.ipcRenderer.receive(
      "vector-database-update",
      vectorDBUpdateListener
    );
    return () => {
      window.ipcRenderer.removeListener(
        "vector-database-update",
        vectorDBUpdateListener
      );
    };
  }, [filePath]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden mt-0 border-l-[0.1px] border-t-0 border-b-0 border-r-0 border-gray-600 border-solid">
      {similarEntries.length > 0 && (
        <div className="flex items-center justify-center bg-gray-800 mt-0 mb-0 p-0">
          <PiGraph className="text-white mt-1" />

          <p className="text-gray-200 text-sm pl-1 mb-0  mt-1 pt-0 pb-0">
            Related Notes
          </p>
        </div>
      )}
      {similarEntries.map((dbResult, index) => (
        <div className="pb-2 pr-2 pl-2 pt-1" key={index}>
          <DBResultPreview
            key={index}
            dbResult={dbResult}
            onSelect={onFileSelect}
          />
        </div>
      ))}
      {similarEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex">
            <p className="text-gray-500 text-lg">
              Related notes will appear here...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimilarEntriesComponent;
