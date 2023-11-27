import React, { useRef, useState } from "react";
import { FileSidebar } from "./File/FileSidebar";
import { FileEditor } from "./File/FileEditor";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import SettingsModal from "./Settings/SettingsModal";
import LeftSidebar from "./LeftSidebar/LeftSidebar";

interface FileEditorContainerProps {}

const FileEditorContainer: React.FC<FileEditorContainerProps> = ({}) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(false);

  const onFileSelect = async (path: string) => {
    // so here we can save the actual content too\\
    if (selectedFilePath && editorContent !== lastSavedContentRef.current) {
      await window.files.writeFile(selectedFilePath, editorContent);
    }
    setSelectedFilePath(path);
    // window.ipcRenderer.send("open-file", path);
  };
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  return (
    <div>
      <TitleBar
        onFileSelect={onFileSelect}
        chatbotOpen={showChatbot}
        toggleChatbot={toggleChatbot}
      />

      <div className="flex" style={{ height: "calc(100vh - 30px)" }}>
        <div className="w-[40px]">
          <LeftSidebar />
        </div>
        <div className="h-full w-[200px]">
          <FileSidebar
            selectedFile={selectedFilePath}
            onFileSelect={onFileSelect}
          />
        </div>
        {selectedFilePath && (
          <div className="flex flex-grow relative">
            <div className="w-2/3 overflow-auto">
              <FileEditor
                filePath={selectedFilePath}
                setContentInParent={setEditorContent}
                lastSavedContentRef={lastSavedContentRef}
              />
            </div>
            <div
              className="w-1/3"
              style={{ marginRight: showChatbot ? "300px" : "0" }}
            >
              <SimilarEntriesComponent
                filePath={selectedFilePath}
                onFileSelect={onFileSelect}
              />
            </div>
            {showChatbot && (
              <div className="absolute right-0 top-0 h-full w-[300px]">
                <ChatWithLLM />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
