import React, { useCallback, useEffect, useState } from "react";

import { EditorContent } from "@tiptap/react";
import posthog from "posthog-js";

import "../styles/global.css";
import ChatWithLLM, { ChatFilters, ChatHistory } from "./Chat/Chat";
import { useChatHistory } from "./Chat/hooks/use-chat-history";
import InEditorBacklinkSuggestionsDisplay from "./Editor/BacklinkSuggestionsDisplay";
import MenuOnHighlight from "./Editor/MenuOnHighlight";
import { useFileInfoTree } from "./File/FileSideBar/hooks/use-file-info-tree";
import { useFileByFilepath } from "./File/hooks/use-file-by-filepath";
import ResizableComponent from "./Generic/ResizableComponent";
import IconsSidebar from "./Sidebars/IconsSidebar";
import SidebarManager from "./Sidebars/MainSidebar";
import SidebarComponent from "./Similarity/SimilarFilesSidebar";
import TitleBar from "./TitleBar";

interface FileEditorContainerProps {}
export type SidebarAbleToShow = "files" | "search" | "chats";

const FileEditorContainer: React.FC<FileEditorContainerProps> = () => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
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

  const { currentChatHistory, setCurrentChatHistory, chatHistoriesMetadata } =
    useChatHistory();

  const { files, flattenedFiles, expandedDirectories, handleDirectoryToggle } =
    useFileInfoTree(filePath);

  const toggleSimilarFiles = () => {
    setShowSimilarFiles(!showSimilarFiles);
  };

  // const [fileIsOpen, setFileIsOpen] = useState(false);

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
    minDate: new Date(0),
    maxDate: new Date(),
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(40);

  const handleContextMenu = (event: any) => {
    event.preventDefault();
    setMenuPosition({
      x: event.pageX,
      y: event.pageY
    });
    setMenuVisible(true);
  }

  const hideMenu = () => {
    if (menuVisible)
      setMenuVisible(false);
  }

  // showSearch should be set to false when:
  //    1) User presses ctrl-f
  //    2)  Navigates away from the editor
  const toggleSearch = useCallback(() => {
    setShowSearch((prevShowSearch) => !prevShowSearch);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    editor?.commands.setSearchTerm(value);
  };

  // Global listener that triggers search functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        toggleSearch();
      }

      if (event.key === "Escape") {
        if (showSearch)
          setShowSearch(false);
        if (menuVisible)
          setMenuVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNextSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      editor?.commands.nextSearchResult();
      goToSelection();
      (event.target as HTMLInputElement).focus();
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
    if (node instanceof Element) {
      node.scrollIntoView?.(false);
    }
  };

  const handleAddFileToChatFilters = (file: string) => {
    setSidebarShowing("chats");
    setShowChatbot(true);
    // setFileIsOpen(false);
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
          <div className="relative w-full h-full flex overflow-x-hidden scrollable-y-thin">
            <div className="w-full flex h-full">
              <div
                className="relative h-full w-full cursor-text text-slate-400"
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
                    className="absolute top-4 right-0  mt-4 mr-14 z-50 border-none rounded-md p-2 bg-transparent bg-dark-gray-c-ten text-white "
                  />
                )}
                {menuVisible && (
                  <MenuOnHighlight
                    editor={editor}
                    menuPosition={menuPosition}
                    setMenuVisible={setMenuVisible}
                  />
                )}
                <EditorContent
                  style={{ wordBreak: "break-word" }}
                  onContextMenu={handleContextMenu}
                  onClick={hideMenu}
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
