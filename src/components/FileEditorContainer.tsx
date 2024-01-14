import React, { useRef, useState } from "react";
import { FileSidebar } from "./File/FileSidebar";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./LeftSidebar/LeftSidebar";
import MarkdownEditor from "./File/MarkdownEditor";
import { MdxEditor } from "./File/MdxEditor";
import { Rnd } from "react-rnd";
import { RndResizeCallback } from "react-rnd";

interface FileEditorContainerProps {}

const FileEditorContainer: React.FC<FileEditorContainerProps> = ({}) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [fileSidebarWidth, setFileSidebarWidth] = useState(200);

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
  const handleResize: RndResizeCallback = (
    e,
    direction,
    ref,
    delta,
    position
  ) => {
    setFileSidebarWidth(ref.offsetWidth);
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
        <div
          className="flex-none"
          style={{ width: "40px", flexGrow: 0, flexShrink: 0 }}
        >
          <LeftSidebar />
        </div>
        <Rnd
          // className="flex-grow"
          default={{
            x: 40, // Starts right after the LeftSidebar
            y: 0,
            width: fileSidebarWidth,
            height: "100%",
          }}
          minWidth={100}
          maxWidth={"50%"}
          bounds="parent"
          onResize={handleResize}
        >
          <div className="h-full">
            <FileSidebar
              selectedFile={selectedFilePath}
              onFileSelect={onFileSelect}
            />
          </div>
        </Rnd>
        {/* </Rnd> */}
        {selectedFilePath && (
          <div
            className="flex-grow h-full flex overflow-x-hidden"
            style={{ marginRight: showChatbot ? "250px" : "0" }}
          >
            <div
              className="flex h-full"
              style={{ marginLeft: fileSidebarWidth }}
            >
              <MdxEditor
                filePath={selectedFilePath}
                setContentInParent={setEditorContent}
                lastSavedContentRef={lastSavedContentRef}
              />
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
          // </div>
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
