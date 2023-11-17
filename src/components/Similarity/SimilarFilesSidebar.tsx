import { useEffect, useState } from "react";
import { RagnoteDBEntry } from "electron/main/embeddings/Table";

interface SimilarEntriesComponentProps {
  filePath: string;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
}) => {
  const [similarEntries, setSimilarEntries] = useState<RagnoteDBEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileRead = async (path: string) => {
    setLoading(true);
    try {
      const fileContent: string = await window.files.readFile(path);
      const searchResults: RagnoteDBEntry[] = await window.database.search(
        fileContent,
        10
      );
      setSimilarEntries(searchResults);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filePath) {
      handleFileRead(filePath);
    }
  }, [filePath]);

  return (
    <div className="max-h-screen overflow-auto">
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="space-y-4">
          {similarEntries.map((entry, index) => (
            <div key={index} className="p-4 bg-white shadow-md rounded-lg">
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
