import { RagnoteDBEntry } from "electron/main/embeddings/Table";
import { useEffect, useState } from "react";

// Ok so what is the API for this?
// Take in a RagnoteDBEntry and then display whatever you want. Or let's spike out which type of data will be passed in. import React, { useState } from 'react';

// interface RagnoteDBEntry {
//   notepath: string;
//   content: string;
//   subnoteindex: number;
//   timeadded: Date;
//   // Add any other properties you need
// }

interface SimilarEntriesComponentProps {
  filePath: string;
}

const SimilarEntriesComponent: React.FC<SimilarEntriesComponentProps> = ({
  filePath,
}) => {
  // const [filePath, setFilePath] = useState<string>('');
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
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {similarEntries.map((entry, index) => (
            <div key={index}>
              <p>Path: {entry.notepath}</p>
              <p>Content: {entry.content}</p>
              <p>Time Added: {entry.timeadded.toString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarEntriesComponent;
