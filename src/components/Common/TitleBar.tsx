import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PiSidebar, PiSidebarFill } from "react-icons/pi";
import { DraggableTabs } from "../Sidebars/DraggableTabs";
import FileHistoryNavigator from "../File/FileSideBar/FileHistoryBar";

export const titleBarHeight = "30px";

interface TitleBarProps {
  onFileSelect: (path: string) => void;
  setFilePath: (path: string) => void;
  currentFilePath: string | null;
  similarFilesOpen: boolean;
  toggleSimilarFiles: () => void;
  history: string[];
  setHistory: (string: string[]) => void;
  openTabs: Tab[];
  setOpenTabs: (string: Tab[]) => void;
  openFileAndOpenEditor: (path: string) => void;
  sidebarWidth: number;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  setFilePath,
  currentFilePath,
  similarFilesOpen,
  toggleSimilarFiles,
  history,
  setHistory,
  openTabs,
  setOpenTabs,
  openFileAndOpenEditor,
  sidebarWidth,
}) => {
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    if (!currentFilePath) return;
    const existingTab = openTabs.find(
      (tab) => tab.filePath === currentFilePath
    );

    if (!existingTab) {
      syncTabsWithBackend(currentFilePath);
      const newTab = createTabObjectFromPath(currentFilePath);
      setOpenTabs((prevTabs) => [...prevTabs, newTab]);
    }
  }, [currentFilePath]);

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electronUtils.getPlatform();
      setPlatform(response);
    };

    fetchPlatform();
  }, []);

  useEffect(() => {
    const fetchHistoryTabs = async () => {
      const response = await window.electronStore.getCurrentOpenFiles();
      setOpenTabs(response);
    };

    fetchHistoryTabs();
  }, []);

  const handleTabSelect = (path: string) => {
    openFileAndOpenEditor(path);
  };

  const handleTabClose = async (event, tabId) => {
    event.stopPropagation();
    console.log("Closing tab!");
    let closedFilePath = "";
    let newIndex = -1;

    setOpenTabs((prevTabs) => {
      const index = prevTabs.findIndex((tab) => tab.id === tabId);
      closedFilePath = index !== -1 ? prevTabs[index].filePath : "";
      newIndex = index > 0 ? index - 1 : 1;
      if (closedFilePath === currentFilePath) {
        if (newIndex === -1 || newIndex >= openTabs.length) {
          openFileAndOpenEditor(""); // If no tabs left or out of range, clear selection
        } else {
          openFileAndOpenEditor(openTabs[newIndex].filePath); // Select the new index's file
        }
      }
      return prevTabs.filter((tab, idx) => idx !== index);
    });

    await window.electronStore.setCurrentOpenFiles("remove", {
      tabId: tabId,
    });
  };

  const syncTabsWithBackend = async (path: string) => {
    const tab = createTabObjectFromPath(path);
    await window.electronStore.setCurrentOpenFiles("add", {
      tab: tab,
    });
  };

  const extractFileName = (path: string) => {
    const parts = path.split(/[/\\]/); // Split on both forward slash and backslash
    return parts.pop(); // Returns the last element, which is the file name
  };

  const createTabObjectFromPath = (path: string) => {
    return {
      id: uuidv4(),
      filePath: path,
      title: extractFileName(path),
      timeOpened: new Date(),
      isDirty: false,
      lastAccessed: new Date(),
    };
  };

  return (
    <div
      id="customTitleBar"
      className={`h-titlebar flex justify-between`}
      style={{ backgroundColor: "#303030", WebkitAppRegion: "drag" }}
    >
      <div
        className="flex mt-[1px]"
        style={
          platform === "darwin" ? { marginLeft: "65px" } : { marginLeft: "2px" }
        }
      >
        <FileHistoryNavigator
          id="titleBarFileNavigator"
          history={history}
          setHistory={setHistory}
          onFileSelect={onFileSelect}
          currentPath={currentFilePath || ""}
          style={{ WebkitAppRegion: "no-drag" }}
        />
      </div>

      <div className="relative flex-grow">
        <div
          className="absolute top-0 bottom-0 left-0 overflow-x-auto scrollable-x-thin overflow-y-hidden"
          style={{
            left: `${sidebarWidth - 25}px`,
            right: "15px",
          }}
        >
          <div className="flex whitespace-nowrap">
            <DraggableTabs
              openTabs={openTabs}
              setOpenTabs={setOpenTabs}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              currentFilePath={currentFilePath}
            />
          </div>
        </div>
      </div>

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
            id="titleBarSimilarFiles"
            className="text-gray-100 cursor-pointer mt-[0.2rem] transform scale-x-[-1]"
            size={22}
            onClick={toggleSimilarFiles}
            title="Hide Similar Files"
          />
        ) : (
          <PiSidebar
            id="titleBarSimilarFiles"
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
