import React, { useEffect, useState } from "react";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import LeftSidebar from "./Sidebars/IconsSidebar";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";
import { EditorContent } from "@tiptap/react";
import InEditorBacklinkSuggestionsDisplay from "./Editor/BacklinkSuggestionsDisplay";
import { useFileInfoTree } from "./File/FileSideBar/hooks/use-file-info-tree";
import RenameNoteModal from "./File/RenameNote";
import RenameDirModal from "./File/RenameDirectory";
import SidebarComponent from "./Similarity/SimilarFilesSidebar";

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
    openRelativePath,
    saveCurrentlyOpenedFile,
    suggestionsState,
    highlightData,
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile,
    navigationHistory,
    setNavigationHistory,
  } = useFileByFilepath();

  const { files, flattenedFiles, expandedDirectories, handleDirectoryToggle } =
    useFileInfoTree(filePath);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };
  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.getAttribute("data-backlink") === "true") {
        event.preventDefault();
        const backlinkPath = target.textContent;
        if (backlinkPath) await openRelativePath(backlinkPath);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [openRelativePath]);

  return (
    <div>
      <TitleBar
        history={navigationHistory}
        setHistory={setNavigationHistory}
        currentFilePath={filePath}
        onFileSelect={openFileByPath}
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
            await renameFile(path, newNoteName);
          }}
        />
      )}
      {fileDirToBeRenamed && (
        <RenameDirModal
          isOpen={!!fileDirToBeRenamed}
          onClose={() => setFileDirToBeRenamed("")}
          fullDirName={fileDirToBeRenamed}
          renameDir={async ({ path, newDirName: newNoteName }) => {
            await renameFile(path, newNoteName);
          }}
        />
      )}
      <div className="flex h-below-titlebar">
        <div className="w-[35px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid">
          <LeftSidebar
            onFileSelect={openFileByPath}
            sidebarShowing={sidebarShowing}
            makeSidebarShow={setSidebarShowing}
          />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="h-full border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid w-full">
            <SidebarManager
              files={files}
              expandedDirectories={expandedDirectories}
              handleDirectoryToggle={handleDirectoryToggle}
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
                {suggestionsState && (
                  <InEditorBacklinkSuggestionsDisplay
                    suggestionsState={suggestionsState}
                    suggestions={flattenedFiles.map(
                      (file) => file.relativePath
                    )}
                  />
                )}
              </div>
              {showSimilarFiles && (
                <SidebarComponent
                  filePath={filePath}
                  highlightData={highlightData}
                  openFileByPath={openFileByPath}
                  saveCurrentlyOpenedFile={async () => {
                    await saveCurrentlyOpenedFile();
                  }}
                />
              )}
            </div>
          </div>
        )}
        {showChatbot && (
          <div
            className={`h-below-titlebar ${filePath ? "" : "absolute right-0"}`}
          >
            <ResizableComponent resizeSide="left" initialWidth={300}>
              <ChatWithLLM
                currentFilePath={filePath}
                openFileByPath={openFileByPath}
              />
            </ResizableComponent>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
