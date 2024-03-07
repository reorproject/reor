import React, { useRef, useState } from "react";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./Sidebars/IconsSidebar";
import MilkdownEditor from "./File/MilkdownEditor";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import { toast } from "react-toastify";
import { TuiEditor } from "./File/TuiEditor";
import QuillEditor from "./File/QuillEditor";
import { MdxEditor } from "./File/MdxEditor";
import TipTapEditor from "./File/TipTapEditor";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [editorContent, setEditorContent] = useState<string>("");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>("files");

  const onFileSelect = async (path: string) => {
    if (selectedFilePath) {
      if (editorContent !== lastSavedContentRef.current) {
        window.files
          .writeFile({
            filePath: selectedFilePath,
            content: editorContent,
          })
          .then(() => {
            window.files.indexFileInDatabase(selectedFilePath);
          })
          .catch((e) => {
            const errorMessage = `Error saving current file! Please open a Github issue. Details: ${
              e.message || e.toString()
            }`;
            toast.error(errorMessage, {
              className: "mt-5",
              autoClose: false,
              closeOnClick: false,
              draggable: false,
            });
          });
      } else {
        window.files.indexFileInDatabase(selectedFilePath);
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
                <TipTapEditor
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
