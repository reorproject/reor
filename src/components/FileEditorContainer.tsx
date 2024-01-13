import React, { useRef, useState } from "react";
import { FileSidebar } from "./File/FileSidebar";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import MarkdownEditor from "./File/MarkdownEditor";
import { MdxEditor } from "./File/MdxEditor";

interface FileEditorContainerProps {}

const FileEditorContainer: React.FC<FileEditorContainerProps> = ({}) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);

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
  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  return (
    <div>
      <TitleBar
        onFileSelect={onFileSelect}
        chatbotOpen={showChatbot}
        toggleChatbot={toggleChatbot}
        toggleSimilarFiles={toggleSimilarFiles}
      />

      <div className="flex" style={{ height: "calc(100vh - 33px)" }}>
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
          <div
            className="w-full h-full flex overflow-x-hidden"
            style={{ marginRight: showChatbot ? "250px" : "0" }}
          >
            <div className="w-full flex h-full ">
              <div
                className="h-full "
                style={{ width: showSimilarFiles ? "75%" : "100%" }}
              >
                <MdxEditor
                  filePath={selectedFilePath}
                  setContentInParent={setEditorContent}
                  lastSavedContentRef={lastSavedContentRef}
                />
                {/* <MilkdownEditor /> */}
              </div>
              {showSimilarFiles && (
                <div className="w-[25%]">
                  <SimilarEntriesComponent
                    filePath={selectedFilePath}
                    onFileSelect={onFileSelect}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {showChatbot && (
          <div
            className="absolute right-0  w-[250px]"
            style={{ height: "calc(100vh - 33px)" }}
          >
            <ChatWithLLM />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
