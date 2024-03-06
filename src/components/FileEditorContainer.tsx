import React, { useEffect, useState } from "react";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./Sidebars/IconsSidebar";
import MilkdownEditor from "./File/MilkdownEditor";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>("files");

  const onFileSelect = async (path: string) => {
    setSelectedFilePath(path);
  };
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };
  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };


  useEffect(() => {
    //checks if file has been deleted, and takes actions accordingly, such as always clearing the related side bar and then clearing the content of the editor
    const vectorDBUpdateListener = async (deletedFilePath: string) => {
      if (deletedFilePath === selectedFilePath) {
        setSelectedFilePath(null);
      }
    }
    window.ipcRenderer.receive(
      "vector-database-update",
      vectorDBUpdateListener
    );
    return () => {
      window.ipcRenderer.removeListener(
        "vector-database-update",
        vectorDBUpdateListener
      );
    };
  },[selectedFilePath, setSelectedFilePath])
  
  return (
    <div>
      <TitleBar
        onFileSelect={onFileSelect}
        chatbotOpen={showChatbot}
        similarFilesOpen={showSimilarFiles}
        toggleChatbot={toggleChatbot}
        toggleSimilarFiles={toggleSimilarFiles}
      />

      <div className="flex h-below-titlebar">
        <div className="w-[40px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-gray-600 border-solid">
          <LeftSidebar
            onFileSelect={onFileSelect}
            sidebarShowing={sidebarShowing}
            makeSidebarShow={setSidebarShowing}
          />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="h-full border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-gray-600 border-solid w-full">
            <SidebarManager
              selectedFilePath={selectedFilePath}
              onFileSelect={onFileSelect}
              sidebarShowing={sidebarShowing}
            />
          </div>
        </ResizableComponent>

        {selectedFilePath && (
          <div className="w-full h-full flex overflow-x-hidden">
            <div className="w-full flex h-full">
              <div className="h-full w-full">
                <MilkdownEditor
                  filePath={selectedFilePath}
                />
              </div>
              {showSimilarFiles && (
                <ResizableComponent resizeSide="left" initialWidth={400}>
                  <SimilarEntriesComponent
                    filePath={selectedFilePath}
                    onFileSelect={onFileSelect}
                  />
                </ResizableComponent>
              )}
            </div>
          </div>
        )}
        {showChatbot && (
          <div
            className={`h-below-titlebar ${
              selectedFilePath ? "" : "absolute right-0"
            }`}
          >
            <ResizableComponent resizeSide="left" initialWidth={300}>
              <ChatWithLLM currentFilePath={selectedFilePath} />
            </ResizableComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
