import React, { useEffect, useState } from "react";

import posthog from "posthog-js";
import { v4 as uuidv4 } from "uuid";

import "../styles/global.css";
import ChatWithLLM, { ChatFilters, ChatHistory } from "./Chat/Chat";
import { useChatHistory } from "./Chat/hooks/use-chat-history";
import ResizableComponent from "./Common/ResizableComponent";
import TitleBar from "./Common/TitleBar";
import EditorManager from "./Editor/EditorManager";
import { DraggableTabs } from "./Sidebars/DraggableTabs.tsx";
import { useFileInfoTree } from "./File/FileSideBar/hooks/use-file-info-tree";
import CreatePreviewFile from "./File/PreviewFile";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";
import IconsSidebar from "./Sidebars/IconsSidebar";
import SidebarManager from "./Sidebars/MainSidebar";
import SimilarFilesSidebarComponent from "./Sidebars/SimilarFilesSidebar";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search" | "chats";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [showSimilarFiles, setShowSimilarFiles] = useState(true);
  const [sidebarShowing, setSidebarShowing] =
    useState<SidebarAbleToShow>("files");
  const {
    filePath,
    editor,
    showQueryBox,
    setShowQueryBox,
    openTabs,
    setOpenTabs,
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

  const { currentChatHistory, setCurrentChatHistory, chatHistoriesMetadata } =
    useChatHistory();

  const { files, flattenedFiles, expandedDirectories, handleDirectoryToggle } =
    useFileInfoTree(filePath);

  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  const openFileAndOpenEditor = async (path: string) => {
    setShowChatbot(false);
    openFileByPath(path);
  };

  const openChatAndOpenChat = (chatHistory: ChatHistory | undefined) => {
    setShowChatbot(true);
    setCurrentChatHistory(chatHistory);
  };

  const [vaultDirectory, setVaultDirectory] = useState<string>("");
  const [chatFilters, setChatFilters] = useState<ChatFilters>({
    files: [],
    numberOfChunksToFetch: 15,
    minDate: new Date(0),
    maxDate: new Date(),
  });
  const [sidebarWidth, setSidebarWidth] = useState(40);

  const handleAddFileToChatFilters = (file: string) => {
    setSidebarShowing("chats");
    setShowChatbot(true);
    // setFileIsOpen(false);
    setCurrentChatHistory(undefined);
    setChatFilters((prevChatFilters) => ({
      ...prevChatFilters,
      files: [...prevChatFilters.files, file],
    }));
  };

  // find all available files
  useEffect(() => {
    const updateWidth = async () => {
      const isCompact = await window.electronStore.getSBCompact();
      setSidebarWidth(isCompact ? 40 : 60);
    };

    // Listen for changes on settings
    const handleSettingsChange = (isCompact: number) => {
      setSidebarWidth(isCompact ? 40 : 60);
    };

    const setFileDirectory = async () => {
      const windowDirectory =
        await window.electronStore.getVaultDirectoryForWindow();
      setVaultDirectory(windowDirectory);
    };
    setFileDirectory();
    updateWidth();

    window.ipcRenderer.receive("sb-compact-changed", handleSettingsChange);
  }, []);

  useEffect(() => {
    const removeAddChatToFileListener = window.ipcRenderer.receive(
      "add-file-to-chat-listener",
      (noteName: string) => {
        handleAddFileToChatFilters(noteName);
      }
    );

    return () => {
      removeAddChatToFileListener();
    };
  }, []);

  useEffect(() => {
    const fetchHistoryTabs = async () => {
      const response = await window.electronStore.getCurrentOpenFiles();
      setOpenTabs(response);
      console.log(`Fetching stored history: ${JSON.stringify(openTabs)}`);
    };

    fetchHistoryTabs();
  }, []);

  /* IPC Communication for Tab updates */
  const syncTabsWithBackend = async (path: string) => {
    /* Deals with already open files */
    const tab = createTabObjectFromPath(path);
    await window.electronStore.setCurrentOpenFiles("add", {
      tab: tab,
    });
  };

  const extractFileName = (path: string) => {
    const parts = path.split(/[/\\]/); // Split on both forward slash and backslash
    return parts.pop(); // Returns the last element, which is the file name
  };

  /* Creates Tab to display */
  const createTabObjectFromPath = (path) => {
    return {
      id: uuidv4(),
      filePath: path,
      title: extractFileName(path),
      timeOpened: new Date(),
      isDirty: false,
      lastAccessed: new Date(),
    };
  };

  useEffect(() => {
    if (!filePath) return;
    console.log(`Filepath changed!`);
    const existingTab = openTabs.find((tab) => tab.filePath === filePath);

    if (!existingTab) {
      syncTabsWithBackend(filePath);
      const newTab = createTabObjectFromPath(filePath);
      // Update the tabs state by adding the new tab
      setOpenTabs((prevTabs) => [...prevTabs, newTab]);
    }
    setShowQueryBox(false);
  }, [filePath]);

  const handleTabSelect = (path: string) => {
    console.log("Tab Selected:", path);
    openFileAndOpenEditor(path);
  };

  const handleTabClose = async (event, tabId) => {
    // Get current file path from the tab to be closed
    event.stopPropagation();
    console.log("Closing tab!");
    let closedFilePath = "";
    let newIndex = -1;

    // Update tabs state and determine the new file to select
    setOpenTabs((prevTabs) => {
      const index = prevTabs.findIndex((tab) => tab.id === tabId);
      closedFilePath = index !== -1 ? prevTabs[index].filePath : "";
      newIndex = index > 0 ? index - 1 : 0; // Set newIndex to previous one or 0
      return prevTabs.filter((tab, idx) => idx !== index);
    });

    // Update the selected file path after state update
    if (closedFilePath === filePath) {
      // If the closed tab was the current file, update the file selection
      if (newIndex === -1 || newIndex >= openTabs.length) {
        openFileAndOpenEditor(""); // If no tabs left or out of range, clear selection
      } else {
        openFileAndOpenEditor(openTabs[newIndex].filePath); // Select the new index's file
      }
    }
    await window.electronStore.setCurrentOpenFiles("remove", {
      tabId: tabId,
    });
  };

  return (
    <div>
      <TitleBar
        history={navigationHistory}
        setHistory={setNavigationHistory}
        currentFilePath={filePath}
        onFileSelect={openFileAndOpenEditor}
        similarFilesOpen={showSimilarFiles} // This might need to be managed differently now
        toggleSimilarFiles={toggleSimilarFiles} // This might need to be managed differently now
      />

      <div className="flex h-below-titlebar">
        <div
          className={`border-l-0 border-b-0 border-t-0 border-r-[0.001px] border-neutral-700 border-solid pt-2.5`}
          style={{ width: `${sidebarWidth}px` }}
        >
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
              setCurrentChatHistory={openChatAndOpenChat}
              setChatFilters={setChatFilters}
              setShowChatbot={setShowChatbot}
            />
          </div>
        </ResizableComponent>

        {!showChatbot && filePath && (
          <div className="relative w-full h-full flex overflow-hidden">
            <div className="flex-grow h-full overflow-hidden">
              <EditorManager
                editor={editor}
                filePath={filePath}
                suggestionsState={suggestionsState}
                flattenedFiles={flattenedFiles}
                showSimilarFiles={showSimilarFiles}
              />{" "}
            </div>

            {showSimilarFiles && (
              <div className="flex-shrink-0 h-full overflow-y-auto overflow-x-hidden">
                <SimilarFilesSidebarComponent
                  filePath={filePath}
                  highlightData={highlightData}
                  openFileByPath={openFileByPath}
                  saveCurrentlyOpenedFile={saveCurrentlyOpenedFile}
                />
              </div>
            )}
          </div>
        )}

        {showChatbot && (
          <div className={`w-full h-below-titlebar`}>
            <ChatWithLLM
              vaultDirectory={vaultDirectory}
              openFileByPath={openFileAndOpenEditor}
              currentChatHistory={currentChatHistory}
              setCurrentChatHistory={setCurrentChatHistory}
              showSimilarFiles={showSimilarFiles} // This might need to be managed differently now
              chatFilters={chatFilters}
              setChatFilters={(chatFilters: ChatFilters) => {
                posthog.capture("add_file_to_chat", {
                  chatFilesLength: chatFilters.files.length,
                });
                setChatFilters(chatFilters);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
