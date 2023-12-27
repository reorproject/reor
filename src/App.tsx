// App.tsx
import React, { useEffect, useState } from "react";
import DirectoryPicker from "./components/Settings/InitialSettingsPage";
import FileEditorContainer from "./components/FileEditorContainer";
import IndexingProgress from "./components/IndexingProgress";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [directory, setDirectory] = useState<string | null>(null);
  const [isIndexing, setIsIndexing] = useState(false); // New state to track indexing

  useEffect(() => {
    const initialDirectory = window.electronStore.getUserDirectory();
    if (initialDirectory) {
      setDirectory(initialDirectory);
      window.database.indexFilesInDirectory(initialDirectory);
      // If directory exists, you may want to check if indexing is needed
    }
  }, []);

  const handleDirectorySelected = (directoryPath: string) => {
    console.log("HANDLING DIRECTORY SELECTED");
    setIsIndexing(true); // Start indexing
    setDirectory(directoryPath);
    // Trigger indexing in your main process here
    // Use IPC to send the directory path to the main process
    window.database.indexFilesInDirectory(directoryPath);
  };

  const handleIndexingComplete = () => {
    setIsIndexing(false); // Indexing completed
  };
  // useEffect(() => {

  return (
    <div className="max-h-screen font-sans bg-gray-800">
      {directory ? (
        isIndexing ? (
          <IndexingProgress onIndexingComplete={handleIndexingComplete} />
        ) : (
          <FileEditorContainer />
        )
      ) : (
        <DirectoryPicker onDirectorySelected={handleDirectorySelected} />
      )}
    </div>
  );
};

export default App;
