import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { PiSidebar, PiSidebarFill } from "react-icons/pi";

import FileHistoryNavigator from "./File/FileSideBar/FileHistoryBar";
import { DraggableTabs } from "./DraggableTabs";

export const titleBarHeight = "30px";

interface TitleBarProps {
  onFileSelect: (path: string) => void;
  currentFilePath: string | null;
  similarFilesOpen: boolean;
  toggleSimilarFiles: () => void;
  history: string[];
  setHistory: (string: string[]) => void;
  openTabs: Tab[];
  setOpenTabs: (openTabs: Tab[]) => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  currentFilePath,
  similarFilesOpen,
  toggleSimilarFiles,
  history,
  setHistory,
  openTabs,
  setOpenTabs,
}) => {
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electron.getPlatform();
      setPlatform(response);
    };

    fetchPlatform();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await window.electronStore.getCurrentOpenFiles();
      setOpenTabs(response);
      console.log(`Fetching stored history: ${JSON.stringify(openTabs)}`);
    };

    fetchHistory();
  }, []);

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

  /* IPC Communication for Tab updates */
  const syncTabsWithBackend = async (path: string) => {
    /* Deals with already open files */
    const tab = createTabObjectFromPath(path);
    await window.electronStore.setCurrentOpenFiles("add", tab);
  };

  const extractFileName = (path: string) => {
    const parts = path.split(/[/\\]/); // Split on both forward slash and backslash
    return parts.pop(); // Returns the last element, which is the file name
  };

  const handleTabSelect = (path: string) => {
    console.log("Tab Selected:", path);
    onFileSelect(path);
  };

  const handleTabClose = (tabId) => {
    setOpenTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));
  };

  return (
    <div
      id="customTitleBar"
      className={`h-titlebar  flex justify-between`}
      style={{ backgroundColor: "#303030" }}
    >
      <div
        className="flex mt-[1px]"
        style={
          platform === "darwin" ? { marginLeft: "65px" } : { marginLeft: "2px" }
        }
      >
        <FileHistoryNavigator
          history={history}
          setHistory={setHistory}
          onFileSelect={onFileSelect}
          currentPath={currentFilePath || ""}
          syncTabsWithBackend={syncTabsWithBackend}
        />
      </div>
      <DraggableTabs
        openTabs={openTabs}
        setOpenTabs={setOpenTabs}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        currentFilePath={currentFilePath}
      />
      <div
        className="flex justify-end align-items-right mt-[0.5px]"
        style={
          platform === "win32"
            ? { marginRight: "8.5rem" }
            : { marginRight: "0.3rem" }
        }
      >
        {similarFilesOpen ? (
          <PiSidebarFill
            className="text-gray-100 cursor-pointer mt-[0.2rem] transform scale-x-[-1]"
            size={22}
            onClick={toggleSimilarFiles}
            title="Hide Similar Files"
          />
        ) : (
          <PiSidebar
            className="text-gray-100 cursor-pointer mt-[0.2rem] transform scale-x-[-1]"
            size={22}
            onClick={toggleSimilarFiles}
            title="Show Similar Files"
          />
        )}
      </div>
    </div>
  );
};

export default TitleBar;
