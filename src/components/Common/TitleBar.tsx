import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PiSidebar, PiSidebarFill } from "react-icons/pi";
import { DraggableTabs } from "../Sidebars/TabSidebar";
import FileHistoryNavigator from "../File/FileSideBar/FileHistoryBar";
import { useTabs } from "../Providers/TabProvider";
export const titleBarHeight = "30px";

interface TitleBarProps {
  onFileSelect: (path: string) => void;
  setFilePath: (path: string | null) => void; // Used to set file path to null when no tabs are open
  currentFilePath: string | null; // Used to create new open tabs when user clicks on new file to open
  similarFilesOpen: boolean;
  toggleSimilarFiles: () => void;
  history: string[];
  setHistory: (string: string[]) => void;
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
  openFileAndOpenEditor,
  sidebarWidth,
}) => {
  const [platform, setPlatform] = useState("");
  const { openTabs, addTab, selectTab, removeTab, updateTabOrder } = useTabs();
  const [openedLastAccess, setOpenedLastAccess] = useState<boolean>(false);

  useEffect(() => {
    if (!currentFilePath) return;
    addTab(currentFilePath);
  }, [currentFilePath]);

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electronUtils.getPlatform();
      setPlatform(response);
    };

    fetchPlatform();
  }, []);

  useEffect(() => {
    const setUpLastAccess = () => {
      if (!openedLastAccess) {
        openTabs.forEach((tab) => {
          if (tab.lastAccessed) {
            setOpenedLastAccess(true);
            openFileAndOpenEditor(tab.filePath);
          }
        });
      }
    };

    setUpLastAccess();
  }, [openTabs]);

  const handleTabSelect = (tab: Tab) => {
    selectTab(tab);
  };

  const handleTabClose = (event, tabId) => {
    event.stopPropagation();
    removeTab(tabId);
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
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
              currentFilePath={currentFilePath}
              updateTabOrder={updateTabOrder}
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
