import { useEffect, useState } from "react";
import DirectoryPicker from "./components/File/DirectoryPicker";
import { FileList } from "./components/File/FileList";
import { FileEditor } from "./components/File/FileEditor";
import LLM from "./components/LLM/LLM";
import SimilarEntriesComponent from "./components/Similarity/SimilarFilesSidebar";
import TitleBar from "./components/TitleBar";

function App() {
  const [directory, setDirectory] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

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

  useEffect(() => {
    console.log("selected file: ", selectedFilePath);
  }, [selectedFilePath]);

  return (
    <div className="max-h-screen">
      <TitleBar />
      {directory ? (
        <div className="flex" style={{ height: "calc(100vh - 30px)" }}>
          <div className="w-[300px]">
            {" "}
            <FileList onFileSelect={(path) => setSelectedFilePath(path)} />
          </div>
          {selectedFilePath && (
            <div className="flex">
              {" "}
              <div className="w-2/3">
                {" "}
                <FileEditor filePath={selectedFilePath} />
              </div>
              <div className="w-1/3">
                {" "}
                <SimilarEntriesComponent
                  filePath={selectedFilePath}
                  onFileSelect={(path) => setSelectedFilePath(path)}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <DirectoryPicker onDirectorySelected={handleDirectorySelected} />
      )}
      {/* <div className="flex" style={{ height: "calc(100vh - 30px)" }}>
        {" "}
        <div className="h-full bg-black w-1/3 overflow-y-auto">
          <FileList onFileSelect={(path) => setSelectedFilePath(path)} />
        </div>
        <SimilarEntriesComponent
          filePath={selectedFilePath || ""}
          onFileSelect={(path) => setSelectedFilePath(path)}
        />
      </div> */}
    </div>
  );
}
export default App;
