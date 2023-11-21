import { useEffect, useState } from "react";
import DirectoryPicker from "./components/File/DirectoryPicker";
import { FileList } from "./components/File/FileList";
import { FileEditor } from "./components/File/FileEditor";
import LLM from "./components/LLM/LLM";
import SimilarEntriesComponent from "./components/Similarity/SimilarFilesSidebar";
import TitleBar from "./components/TitleBar";

function App() {
  const [directory, setDirectory] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
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

  useEffect(() => {
    console.log("editor content in parent: ", editorContent);
  }, [editorContent]);

  const onFileSelect = async (path: string) => {
    // so here we can save the actual content too
    if (selectedFilePath) {
      await window.files.writeFile(selectedFilePath, editorContent);
    }
    setSelectedFilePath(path);
    // window.ipcRenderer.send("open-file", path);
  };

  return (
    <div className="max-h-screen">
      <TitleBar onFileSelect={onFileSelect} />
      {directory ? (
        <div className="flex" style={{ height: "calc(100vh - 30px)" }}>
          <div className="w-[300px]">
            {" "}
            <FileList
              selectedFile={selectedFilePath}
              onFileSelect={onFileSelect}
            />
          </div>
          {selectedFilePath && (
            <div className="flex" style={{ width: "calc(100vw - 300px)" }}>
              {" "}
              <div className="w-2/3 overflow-auto">
                {" "}
                <FileEditor
                  filePath={selectedFilePath}
                  setContentInParent={setEditorContent}
                />
              </div>
              <div className="w-1/3">
                {" "}
                <SimilarEntriesComponent
                  filePath={selectedFilePath}
                  onFileSelect={onFileSelect}
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
          <FileList onFileSelect={onFileSelect} />
        </div>
        <SimilarEntriesComponent
          filePath={selectedFilePath || ""}
          onFileSelect={onFileSelect}
        />
      </div> */}
    </div>
  );
}
export default App;
