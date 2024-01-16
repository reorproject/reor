import { useEffect, useState } from "react";
import { DBEntry } from "electron/main/database/LanceTableWrapper";
import ReactMarkdown from "react-markdown";
import FilePreview from "../File/DBResultPreview";

interface SimilarEntriesComponentProps {
  filePath: string;
  onFileSelect: (path: string) => void;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
  onFileSelect,
}) => {
  const [similarEntries, setSimilarEntries] = useState<DBEntry[]>([]);
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

  const performSearch = async (path: string): Promise<DBEntry[]> => {
    const fileContent: string = await window.files.readFile(path);
    if (!fileContent) {
      console.error("File content is empty");
      return [];
    }
    const searchResults: DBEntry[] = await window.database.search(
      fileContent,
      20
    );
    // filter out the current file:
    const filteredSearchResults = searchResults.filter(
      (result) => result.notepath !== path
    );
    return filteredSearchResults;
  };

  useEffect(() => {
    if (filePath) {
      handleNewFileOpen(filePath);
    }
  }, [filePath]);

  useEffect(() => {
    const listener = async () => {
      console.log("received vector-database-update event");
      const searchResults = await performSearch(filePath);
      setSimilarEntries(searchResults);
    };

    window.ipcRenderer.receive("vector-database-update", listener);
    return () => {
      window.ipcRenderer.removeListener("vector-database-update", listener);
    };
  }, [filePath]);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden mt-0">
      {similarEntries.map((entry, index) => (
        <FilePreview key={index} entry={entry} onSelect={onFileSelect} />
      ))}
    </div>
  );
};

export default SimilarEntriesComponent;
