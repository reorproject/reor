import React, { useState } from "react";
import SimilarEntriesComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./Sidebars/IconsSidebar";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";
import { EditorContent } from "@tiptap/react";
import RenameNoteModal from "./File/RenameNote";
import RenameDirModal from "./File/RenameDirectory";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [showChatbot, setShowChatbot] = useState<boolean>(true);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>("files");

  const {
    filePath,
    editor,
    openFileByPath,
    saveCurrentlyOpenedFile,
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile,
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
        chatbotOpen={showChatbot}
        similarFilesOpen={showSimilarFiles}
        toggleChatbot={toggleChatbot}
        toggleSimilarFiles={toggleSimilarFiles}
      />
      {noteToBeRenamed && (
        <RenameNoteModal
          isOpen={!!noteToBeRenamed}
          onClose={() => setNoteToBeRenamed("")}
          fullNoteName={noteToBeRenamed}
          renameNote={async ({ path, newNoteName }) => {
            console.log("Renaming note", path, newNoteName)
            await renameFile(path, newNoteName);
          }}
        />
      )}
      {fileDirToBeRenamed && (
        <RenameDirModal
          isOpen={!!fileDirToBeRenamed}
          onClose={() => setFileDirToBeRenamed("")}
          fullDirName={fileDirToBeRenamed}
          renameDir={async ({ path, newNoteName }) => {
            await renameFile(path, newNoteName);
          }}
        />
      )}
      <div className="flex h-below-titlebar">
        <div className="w-[40px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid">
          <LeftSidebar
            onFileSelect={openFileByPath}
            sidebarShowing={sidebarShowing}
            makeSidebarShow={setSidebarShowing}
          />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="h-full border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid w-full">
            <SidebarManager
              selectedFilePath={filePath}
              onFileSelect={openFileByPath}
              sidebarShowing={sidebarShowing}
            />
          </div>
        </ResizableComponent>

        {filePath && (
          <div className="w-full h-full flex overflow-x-hidden">
            <div className="w-full flex h-full">
              <div
                className="h-full w-full overflow-y-auto cursor-text text-slate-400"
                onClick={() => editor?.commands.focus()}
                style={{
                  backgroundColor: "rgb(30, 30, 30)",
                }}
              >
                <EditorContent
                  style={{ wordBreak: "break-word" }}
                  editor={editor}
                />
              </div>
              {showSimilarFiles && (
                <ResizableComponent resizeSide="left" initialWidth={400}>
                  <SimilarEntriesComponent
                    filePath={filePath}
                    onFileSelect={openFileByPath}
                    saveCurrentFile={async () => {
                      await saveCurrentlyOpenedFile();
                    }}
                  />
                </ResizableComponent>
              )}
            </div>
          </div>
        )}
        {showChatbot && (
          <div
            className={`h-below-titlebar ${filePath ? "" : "absolute right-0"}`}
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
