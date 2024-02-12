import React, { useRef, useState } from "react";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./Sidebars/IconsSidebar";
import MilkdownEditor from "./File/MilkdownEditor";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import { toast } from "react-toastify";

interface FileEditorContainerProps {
  windowVaultDirectory: string;
}
export type SidebarAbleToShow = "files" | "search";

const FileEditorContainer: React.FC<FileEditorContainerProps> = ({
  windowVaultDirectory,
}) => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>("files");

  const onFileSelect = async (path: string) => {
    if (selectedFilePath && editorContent !== lastSavedContentRef.current) {
      try {
        await window.files.writeFile(selectedFilePath, editorContent); // save the current content.
      } catch (e) {
        toast.error("Error saving current file! Please try again.", {
          className: "mt-5",
        });
        return;
      }
    }
    setSelectedFilePath(path);
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
        makeSidebarShow={setSidebarShowing}
      />

      <div
        className="flex h-below-titlebar"
        // style={{ height: `calc(100vh - ${titleBarHeight})` }}
      >
        <div className="w-[40px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-gray-600 border-solid">
          <LeftSidebar
            onFileSelect={onFileSelect}
            sidebarShowing={sidebarShowing}
            makeSidebarShow={setSidebarShowing}
            windowVaultDirectory={windowVaultDirectory}
          />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="h-full border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-gray-600 border-solid w-full">
            <SidebarManager
              selectedFilePath={selectedFilePath}
              onFileSelect={onFileSelect}
              sidebarShowing={sidebarShowing}
              windowVaultDirectory={windowVaultDirectory}
            />
          </div>
        </ResizableComponent>

        {selectedFilePath && (
          <div className="w-full h-full flex overflow-x-hidden">
            <div className="w-full flex h-full">
              <div className="h-full w-full">
                <MilkdownEditor
                  filePath={selectedFilePath}
                  setContentInParent={setEditorContent}
                  lastSavedContentRef={lastSavedContentRef}
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
            // style={{ height: `calc(100vh - ${titleBarHeight})` }}
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
