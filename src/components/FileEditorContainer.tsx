import { EditorContent } from "@tiptap/react";
import posthog from "posthog-js";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import ChatWithLLM, { ChatFilters, ChatHistory } from "./Chat/Chat";
import { useChatHistory } from "./Chat/hooks/use-chat-history";
import { DraggableTabs } from "./DraggableTabs";
import InEditorBacklinkSuggestionsDisplay from "./Editor/BacklinkSuggestionsDisplay";
import QueryInput from "./Editor/QueryInput";
import { useFileInfoTree } from "./File/FileSideBar/hooks/use-file-info-tree";
import CreatePreviewFile from "./File/PreviewFile";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";
import ResizableComponent from "./Generic/ResizableComponent";
import IconsSidebar from "./Sidebars/IconsSidebar";
import SidebarManager from "./Sidebars/MainSidebar";
import SidebarComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";

interface FileEditorContainerProps { }
export type SidebarAbleToShow = "files" | "search" | "chats";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [showSimilarFiles, setShowSimilarFiles] = useState<boolean>(true);
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

  const [showQueryWindow, setShowQueryWindow] = useState<boolean>(false);
  const [query, setQuery] = useState<Query | null>(null);

  const openFileAndOpenEditor = async (path: string) => {
    setShowChatbot(false);
    // setFileIsOpen(true);
    openFileByPath(path);
  };

  const openChatAndOpenChat = (chatHistory: ChatHistory | undefined) => {
    setShowChatbot(true);
    // setFileIsOpen(false);
    setCurrentChatHistory(chatHistory);
  };

  const [vaultDirectory, setVaultDirectory] = useState<string>("");
  const [chatFilters, setChatFilters] = useState<ChatFilters>({
    files: [],
    numberOfChunksToFetch: 15,
  });

  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [sidebarWidth, setSidebarWidth] = useState(40);

  // showSearch should be set to false when:
  //    1) User presses ctrl-f
  //    2)  Navigates away from the editor
  const toggleSearch = useCallback(() => {
    setShowSearch((prevShowSearch) => !prevShowSearch);
  });

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    editor.commands.setSearchTerm(value);
  };

  // Global listener that triggers search functionality
  useEffect(() => {
    const handleKeyDown = () => {
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        toggleSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNextSearch = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      editor.commands.nextSearchResult();
      goToSelection();
      event.target.focus();
    } else if (event.key === "Escape") {
      toggleSearch();
      handleSearchChange("");
    }
  };

  const goToSelection = () => {
    if (!editor) return;

    const { results, resultIndex } = editor.storage.searchAndReplace;
    const position = results[resultIndex];
    if (!position) return;

    editor.commands.setTextSelection(position);
    const { node } = editor.view.domAtPos(editor.state.selection.anchor);
    if (node) {
      (node as any).scrollIntoView?.(false);
    }
  };

  const handleAddFileToChatFilters = (file: string) => {
    setSidebarShowing("chats");
    setShowChatbot(true);
    setFileIsOpen(false);
    setCurrentChatHistory(undefined);
    setChatFilters((prevChatFilters) => ({
      ...prevChatFilters,
      files: [...prevChatFilters.files, file],
    }));
    posthog.capture("add_file_to_chat", {
      chatFilesLength: files.length,
    });
  };

  // find all available files
  useEffect(() => {
    console.log(`Inside useEffect!`);
    const updateWidth = async () => {
      const isCompact = await window.electronStore.getSBCompact();
      setSidebarWidth(isCompact ? 40 : 60);
    };

    // Listen for changes on settings
    const handleSettingsChange = (isCompact) => {
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
    console.log(`Sidebar width updated to: ${sidebarWidth}`);
  }, [sidebarWidth]);

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
  }, [filePath]);

  const handleTabSelect = (path: string) => {
    console.log("Tab Selected:", path);
    openFileAndOpenEditor(path);
  };

  const handleTabClose = async (tabId) => {
    // Get current file path from the tab to be closed
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
        similarFilesOpen={showSimilarFiles}
        toggleSimilarFiles={toggleSimilarFiles}
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
          <div className="relative w-full h-full flex overflow-x-hidden">
            <div className="w-full flex h-full">
              <div
                className="relative h-full w-full overflow-y-auto cursor-text text-slate-400"
                onClick={() => editor?.commands.focus()}
                style={{
                  backgroundColor: "rgb(30, 30, 30)",
                }}
              >
                {showSearch && (
                  <input
                    type="text"
                    value={searchTerm}
                    onKeyDown={handleNextSearch}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    onBlur={() => {
                      setShowSearch(false);
                      handleSearchChange("");
                    }}
                    placeholder="Search..."
                    autoFocus
                    className="fixed top-8 right-64  mt-4 mr-14 z-50 border-none rounded-md p-2 bg-transparent bg-dark-gray-c-ten text-white"
                  />
                )}
                <div className="flex-col h-full">
                  <DraggableTabs
                    openTabs={openTabs}
                    setOpenTabs={setOpenTabs}
                    onTabSelect={handleTabSelect}
                    onTabClose={handleTabClose}
                    currentFilePath={filePath}
                  />
                  <EditorContent
                    style={{ wordBreak: "break-word" }}
                    editor={editor}
                  />
                  {showQueryBox && (
                    <div className="fixed bottom-0 w-full">
                      <QueryInput
                        setShowQueryBox={setShowQueryBox}
                        filePath={filePath}
                        setShowQueryWindow={setShowQueryWindow}
                        setQuery={setQuery}
                      />
                    </div>
                  )}
                </div>

                {suggestionsState && (
                  <InEditorBacklinkSuggestionsDisplay
                    suggestionsState={suggestionsState}
                    suggestions={flattenedFiles.map(
                      (file) => file.relativePath
                    )}
                  />
                )}
              </div>
              {showSimilarFiles && !showQueryWindow ? (
                <SidebarComponent
                  filePath={filePath}
                  highlightData={highlightData}
                  openFileByPath={openFileAndOpenEditor}
                  saveCurrentlyOpenedFile={async () => {
                    await saveCurrentlyOpenedFile();
                  }}
                />
              ) : (
                <ResizableComponent resizeSide="left">
                  <CreatePreviewFile
                    query={query}
                    editorContent={editor?.getText()}
                  />
                </ResizableComponent>
              )}
            </div>
          </div>
        )}

        {showChatbot && (
          <div className={`w-full h-below-titlebar`}>
            {/* <ResizableComponent resizeSide="left" initialWidth={450}> */}
            <ChatWithLLM
              vaultDirectory={vaultDirectory}
              openFileByPath={openFileAndOpenEditor}
              currentChatHistory={currentChatHistory}
              setCurrentChatHistory={setCurrentChatHistory}
              showSimilarFiles={showSimilarFiles}
              chatFilters={chatFilters}
              setChatFilters={(chatFilters: ChatFilters) => {
                posthog.capture("add_file_to_chat", {
                  chatFilesLength: chatFilters.files.length,
                });

                setChatFilters(chatFilters);
              }}
            />
            {/* </ResizableComponent> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditorContainer;
