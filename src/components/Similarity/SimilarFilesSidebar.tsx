import { useEffect, useState } from "react";
import { RagnoteDBEntry } from "electron/main/embeddings/Table";
interface SimilarEntriesComponentProps {
  filePath: string;
  onFileSelect: (path: string) => void;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
  onFileSelect,
}) => {
  const [similarEntries, setSimilarEntries] = useState<RagnoteDBEntry[]>([]);
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

  const performSearch = async (path: string): Promise<RagnoteDBEntry[]> => {
    const fileContent: string = await window.files.readFile(path);
    const searchResults: RagnoteDBEntry[] = await window.database.search(
      fileContent,
      10
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
    const listener = () => {
      console.log("received vector-database-update event");
      performSearch(filePath)
        .then((results) => setSimilarEntries(results))
        .catch((error) => console.error("Error:", error));
    };

    window.ipcRenderer.receive("vector-database-update", listener);
    return () => {
      window.ipcRenderer.removeListener("vector-database-update", listener);
    };
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="space-y-4">
          {similarEntries.map((entry, index) => (
            <div
              key={index}
              className="p-10 bg-white shadow-md rounded-lg cursor-pointer hover:scale-104 hover:shadow-lg transition-transform duration-300"
              onClick={() => onFileSelect(entry.notepath)}
            >
              <p className="text-gray-700">
                <span className="text-gray-500">{entry.content}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarEntriesComponent;
