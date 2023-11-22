import { useEffect, useState } from "react";
import DirectoryPicker from "./components/File/DirectoryPicker";
import FileEditorContainer from "./components/FileEditorContainer";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [directory, setDirectory] = useState<string | null>(null);

  useEffect(() => {
    const initialDirectory = window.electronStore.getUserDirectory();

    if (initialDirectory) {
      setDirectory(initialDirectory);
    }
  }, []);

  const handleDirectorySelected = (path: string) => {
    setDirectory(path);
    // so here we need to trigger some kind of setup vector db on directory:
  };

  return (
    <div className="max-h-screen">
      {/* <TitleBar onFileSelect={onFileSelect} /> */}
      {directory ? (
        <FileEditorContainer />
      ) : (
        <DirectoryPicker onDirectorySelected={handleDirectorySelected} />
      )}
    </div>
  );
};

export default App;
