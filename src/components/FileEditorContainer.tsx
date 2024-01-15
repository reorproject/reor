import React, { useRef, useState } from "react";
import { FileSidebar } from "./File/FileSidebar";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import MarkdownEditor from "./File/MarkdownEditor";
import { MdxEditor } from "./File/MdxEditor";
import ResizableComponent from "./Generic/ResizableComponent";

interface FileEditorContainerProps {}

const FileEditorContainer: React.FC<FileEditorContainerProps> = ({}) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
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
        <div className="w-[40px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-gray-600 border-solid">
          <LeftSidebar />
        </div>
        <ResizableComponent resizeSide="right">
          <div className="h-full ">
            <FileSidebar
              selectedFile={selectedFilePath}
              onFileSelect={onFileSelect}
            />
          </div>
        </ResizableComponent>
        {selectedFilePath && (
          <div
            className="w-full h-full flex overflow-x-hidden"
            // style={{ marginRight: showChatbot ? "250px" : "0" }}
          >
            <div className="w-full flex h-full">
              <div
                className="h-full bg-gray-900 w-full"
                // style={{ width: showSimilarFiles ? "75%" : "100%" }}
              >
                <MarkdownEditor
                  filePath={selectedFilePath}
                  setContentInParent={setEditorContent}
                  lastSavedContentRef={lastSavedContentRef}
                />
                {/* <MilkdownEditor /> */}
              </div>
              {showSimilarFiles && (
                <ResizableComponent resizeSide="left" initialWidth={400}>
                  {/* <div className="w-full"> */}
                  <SimilarEntriesComponent
                    filePath={selectedFilePath}
                    onFileSelect={onFileSelect}
                  />
                  {/* </div> */}
                </ResizableComponent>
              )}
            </div>
          </div>
        )}
        {showChatbot && (
          <div
            className={`${selectedFilePath ? "" : "absolute right-0"}`}
            style={{ height: "calc(100vh - 33px)" }}
          >
            <ResizableComponent resizeSide="left" initialWidth={300}>
              <ChatWithLLM />
            </ResizableComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
