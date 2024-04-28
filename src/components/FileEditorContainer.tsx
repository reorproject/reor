import React, { useEffect, useState } from "react";
import TitleBar from "./TitleBar";
import ChatWithLLM, { ChatHistory } from "./Chat/Chat";
import IconsSidebar from "./Sidebars/IconsSidebar";
import ResizableComponent from "./Generic/ResizableComponent";
import SidebarManager from "./Sidebars/MainSidebar";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";
import { EditorContent } from "@tiptap/react";
import FilesSuggestionsDisplay from "./Editor/FilesSuggestionsDisplay";
import { useFileInfoTree } from "./File/FileSideBar/hooks/use-file-info-tree";
import SidebarComponent from "./Similarity/SimilarFilesSidebar";
import { getChatHistoryContext, useChatHistory } from "./Chat/hooks/use-chat-history";

interface FileEditorContainerProps {}
export enum SidebarAbleToShow {
  FILES = "files",
  SEARCH = "search",
  CHATS = "chats",
}

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>(SidebarAbleToShow.FILES);
  const [vaultDirectory, setVaultDirectory] = useState<string>("");

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

  const {
    chatFilePath,
    currentChatHistory,
    setCurrentChatHistory,
    chatHistoriesMetadata,
    setChatHistoriesMetadata,
    currentChatContext,
    setCurrentChatContext,
    chatFilters,
    setChatFilters,
    handleSetChatFilePath,
  } = useChatHistory();

  const { files, flattenedFiles, expandedDirectories, handleDirectoryToggle } =
    useFileInfoTree(filePath);

  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  const openFileAndOpenEditor = async (path: string) => {
    setShowChatbot(false);
    openFileByPath(path);
  };

  const openChatAndSetHistory = (chatHistory: ChatHistory | undefined) => {
    setShowChatbot(true);
    setCurrentChatHistory(chatHistory);
    setCurrentChatContext(getChatHistoryContext(chatHistory));
    handleSetChatFilePath("")
  };

  // open chat when context menu option is selected
  useEffect(() => {
    const removeOpenChatWithFileListener = window.ipcRenderer.receive(
      "create-chat-with-file-listener",
      (noteName: string) => {
        setSidebarShowing(SidebarAbleToShow.CHATS);
        handleSetChatFilePath(noteName);
        setShowChatbot(true);
        setCurrentChatHistory(undefined);
      }
    );

    return () => {
      removeOpenChatWithFileListener();
    };
  }, []);


  // find all available files in the vault directory
  useEffect(() => {
    const setFileDirectory = async () => {
      const windowDirectory =
        await window.electronStore.getVaultDirectoryForWindow();
      setVaultDirectory(windowDirectory);
    };
    setFileDirectory();
  }, []);


  return (
    <div>
      <TitleBar
        history={navigationHistory}
        setHistory={setNavigationHistory}
        currentFilePath={filePath}
        onFileSelect={openFileAndOpenEditor}
        similarFilesOpen={showSimilarFiles}
        toggleSimilarFiles={toggleSimilarFiles}
      />

      <div className="flex h-below-titlebar">
        <div className="w-[35px] border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid">
          <IconsSidebar
            openRelativePath={openRelativePath}
            sidebarShowing={sidebarShowing}
            makeSidebarShow={setSidebarShowing}
            filePath={filePath}
          />
        </div>

        <ResizableComponent resizeSide="right">
          <div className="h-full border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid w-full">
            <SidebarManager
              files={files}
              expandedDirectories={expandedDirectories}
              handleDirectoryToggle={handleDirectoryToggle}
              selectedFilePath={filePath}
              onFileSelect={openFileAndOpenEditor}
              sidebarShowing={sidebarShowing}
              renameFile={renameFile}
              noteToBeRenamed={noteToBeRenamed}
              setNoteToBeRenamed={setNoteToBeRenamed}
              fileDirToBeRenamed={fileDirToBeRenamed}
              setFileDirToBeRenamed={setFileDirToBeRenamed}
              currentChatHistory={currentChatHistory}
              chatHistoriesMetadata={chatHistoriesMetadata}
              setCurrentChatHistory={openChatAndSetHistory}
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
                  <FilesSuggestionsDisplay
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
                  openFileByPath={openFileAndOpenEditor}
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
              vaultDirectory={vaultDirectory}
              filePath={chatFilePath}
              setFilePath={handleSetChatFilePath}
              chatFilters={chatFilters}
              setChatFilters={setChatFilters}
              openFileByPath={openFileAndOpenEditor}
              setChatHistoriesMetadata={setChatHistoriesMetadata}
              currentChatHistory={currentChatHistory}
              setCurrentChatHistory={setCurrentChatHistory}
              showSimilarFiles={showSimilarFiles}
              currentChatContext={currentChatContext}
              setCurrentChatContext={setCurrentChatContext}
            />
            {/* </ResizableComponent> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
