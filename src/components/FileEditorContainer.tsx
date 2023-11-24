import React, { useRef, useState } from "react";
import { FileSidebar } from "./File/FileSidebar";
import { FileEditor } from "./File/FileEditor";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import SettingsModal from "./Settings/SettingsModal";

interface FileEditorContainerProps {}

const FileEditorContainer: React.FC<FileEditorContainerProps> = ({}) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [isModalOpen, setModalOpen] = useState(false);

  const onFileSelect = async (path: string) => {
    // so here we can save the actual content too\\
    if (selectedFilePath && editorContent !== lastSavedContentRef.current) {
      await window.files.writeFile(selectedFilePath, editorContent);
    }
    setSelectedFilePath(path);
    // window.ipcRenderer.send("open-file", path);
  };

  return (
    <div>
      <TitleBar onFileSelect={onFileSelect} />

      <div className="flex" style={{ height: "calc(100vh - 30px)" }}>
        <div className="h-full w-[300px]">
          <FileSidebar
            selectedFile={selectedFilePath}
            onFileSelect={onFileSelect}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setModalOpen(true)}
          >
            Open Settings
          </button>
          <SettingsModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
          />
        </div>
        {selectedFilePath && (
          <div className="flex" style={{ width: "calc(100vw - 300px)" }}>
            <div className="w-2/3 overflow-auto">
              <FileEditor
                filePath={selectedFilePath}
                // content={editorContent}
                setContentInParent={setEditorContent}
                lastSavedContentRef={lastSavedContentRef}
              />
            </div>
            <div className="w-1/3">
              <SimilarEntriesComponent
                filePath={selectedFilePath}
                onFileSelect={onFileSelect}
              />
            </div>
          </div>
        )}
        <ChatWithLLM />
      </div>
    </div>
  );
};

export default FileEditorContainer;
