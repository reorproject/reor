import React, { useEffect, useState } from "react";
import { DBResult } from "electron/main/database/LanceTableWrapper";
import { DBResultPreview } from "../File/DBResultPreview";

interface SimilarEntriesComponentProps {
  filePath: string;
  onFileSelect: (path: string) => void;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
  onFileSelect,
}) => {
  const [similarEntries, setSimilarEntries] = useState<DBResult[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);

  const handleNewFileOpen = async (path: string) => {
    setLoading(true);
    try {
      const searchResults = await performSearch(path);
      setSimilarEntries(searchResults);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (filePath: string): Promise<DBResult[]> => {
    const fileContent: string = await window.files.readFile(filePath);
    if (!fileContent) {
      console.error("File content is empty");
      return [];
    }
    const databaseFields = await window.database.getDatabaseFields();
    const filterString = `${databaseFields.NOTE_PATH} != '${filePath}'`;
    const searchResults: DBResult[] = await window.database.search(
      fileContent,
      30,
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
      const searchResults = await performSearch(filePath);
      setSimilarEntries(searchResults);
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
      {similarEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex">
            <p className="text-gray-500 text-lg">
              Waiting for related notes...
            </p>
          </div>
        </div>
      )}
      {similarEntries.map((dbResult, index) => (
        <div className="p-2" key={index}>
          <DBResultPreview
            key={index}
            dbResult={dbResult}
            onSelect={onFileSelect}
          />
        </div>
      ))}
    </div>
  );
};

export default SimilarEntriesComponent;
