import React, { useState } from "react";
import TitleBar from "./TitleBar";
import ChatWithLLM from "./Chat/Chat";
import IconsSidebar from "./Sidebars/IconsSidebar";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";
import { EditorContent } from "@tiptap/react";
import InEditorBacklinkSuggestionsDisplay from "./Editor/BacklinkSuggestionsDisplay";
import { useFileInfoTree } from "./File/FileSideBar/hooks/use-file-info-tree";
import SidebarComponent from "./Similarity/SimilarFilesSidebar";
import { useChatHistory } from "./Chat/hooks/use-chat-history";
import { ChatHistory } from "electron/main/Store/storeConfig";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search" | "chats";

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

  const {
    allChatHistories,
    setAllChatHistories,
    currentChatHistory,
    setCurrentChatHistory,
  } = useChatHistory();

  const { files, flattenedFiles, expandedDirectories, handleDirectoryToggle } =
    useFileInfoTree(filePath);

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };
  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  const openFileOverwrite = async (path: string) => {
    setShowChatbot(false);
    openFileByPath(path);
  };

  const openChatOverwrite = (chatHistory: ChatHistory | undefined) => {
    setShowChatbot(true);
    setCurrentChatHistory(chatHistory);
  };

  return (
    <div>
      <TitleBar
        history={navigationHistory}
        setHistory={setNavigationHistory}
        currentFilePath={filePath}
        onFileSelect={openFileOverwrite}
        chatbotOpen={showChatbot}
        similarFilesOpen={showSimilarFiles}
        toggleChatbot={toggleChatbot}
        toggleSimilarFiles={toggleSimilarFiles}
      />

      <div className="flex h-below-titlebar">
        <div className="w-[35px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid">
          <IconsSidebar
            onFileSelect={openFileOverwrite}
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
              onFileSelect={openFileOverwrite}
              sidebarShowing={sidebarShowing}
              renameFile={renameFile}
              noteToBeRenamed={noteToBeRenamed}
              setNoteToBeRenamed={setNoteToBeRenamed}
              fileDirToBeRenamed={fileDirToBeRenamed}
              setFileDirToBeRenamed={setFileDirToBeRenamed}
              currentChatHistory={currentChatHistory}
              allChatHistories={allChatHistories}
              setCurrentChatHistory={openChatOverwrite}
            />
          </div>
        </ResizableComponent>

        {!showChatbot && filePath && (
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
                  openFileByPath={openFileOverwrite}
                  saveCurrentlyOpenedFile={async () => {
                    await saveCurrentlyOpenedFile();
                  }}
                />
              )}
            </div>
          </div>
        )}

        {showChatbot && (
          <div className={`w-full h-below-titlebar`}>
            {/* <ResizableComponent resizeSide="left" initialWidth={450}> */}
            <ChatWithLLM
              setAllChatHistories={setAllChatHistories}
              currentChatHistory={currentChatHistory}
              setCurrentChatHistory={setCurrentChatHistory}
            />
            {/* </ResizableComponent> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
