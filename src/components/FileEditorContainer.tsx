import React, { useState } from "react";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./Sidebars/IconsSidebar";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import TipTapEditor from "./File/TipTapEditor";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  // const [editorContent, setEditorContent] = useState<string>("");
  // const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  // const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>("files");

  const {
    filePath,
    setEditor,
    fileContent,
    // deleteFile,
    openFileByPath,
  } = useFileByFilepath();

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };
  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  return (
    <div>
      <TitleBar
        onFileSelect={openFileByPath}
        chatbotOpen={showChatbot}
        similarFilesOpen={showSimilarFiles}
        toggleChatbot={toggleChatbot}
        toggleSimilarFiles={toggleSimilarFiles}
      />

      <div className="flex h-below-titlebar">
        <div className="w-[40px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-gray-600 border-solid">
          <LeftSidebar
            onFileSelect={openFileByPath}
            sidebarShowing={sidebarShowing}
            makeSidebarShow={setSidebarShowing}
          />
        </div>
        {/* <button onClick={() => deleteFile(filePath || '')}>Delete File</button> */}

        <ResizableComponent resizeSide="right">
          <div className="h-full border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-gray-600 border-solid w-full">
            <SidebarManager
              selectedFilePath={filePath}
              onFileSelect={openFileByPath}
              sidebarShowing={sidebarShowing}
            />
          </div>
        </ResizableComponent>

        {filePath && (fileContent || fileContent === '') && (
          <div className="w-full h-full flex overflow-x-hidden">
            <div className="w-full flex h-full">
              <div className="h-full w-full">
                <TipTapEditor
                  fileContent={fileContent}
                  setEditor={setEditor}
                />
              </div>
              {showSimilarFiles && (
                <ResizableComponent resizeSide="left" initialWidth={400}>
                  <SimilarEntriesComponent
                    filePath={filePath}
                    onFileSelect={openFileByPath}
                  />
                </ResizableComponent>
              )}
            </div>
          </div>
        )}
        {showChatbot && (
          <div
            className={`h-below-titlebar ${
              filePath ? "" : "absolute right-0"
            }`}
          >
            <ResizableComponent resizeSide="left" initialWidth={300}>
              <ChatWithLLM currentFilePath={filePath} />
            </ResizableComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
