import { useEffect, useState } from "react";
import DirectoryPicker from "./components/File/DirectoryPicker";
import { FileList } from "./components/File/FileList";
import { FileEditor } from "./components/File/FileEditor";
import LLM from "./components/LLM/LLM";

function App() {
  const [directory, setDirectory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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
    <>
      {/* <FileViewer directory="/Users/sam/Desktop/electron-forge-react-typescript-tailwind" /> */}
      {directory ? (
        <div>
          <h1>Directory is set to: {directory}</h1>
          <FileList onFileSelect={(path) => setSelectedFile(path)} />
          {selectedFile && <FileEditor filePath={selectedFile} />}
        </div>
      ) : (
        <DirectoryPicker onDirectorySelected={handleDirectorySelected} />
      )}
      <LLM />
    </>
  );
}
export default App;
