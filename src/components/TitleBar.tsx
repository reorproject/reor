import React, { useEffect, useState } from "react";

import { PiSidebar, PiSidebarFill } from "react-icons/pi";

import FileHistoryNavigator from "./File/FileSideBar/FileHistoryBar";

export const titleBarHeight = "30px";

interface TitleBarProps {
  onFileSelect: (path: string) => void;
  currentFilePath: string | null;
  similarFilesOpen: boolean;
  toggleSimilarFiles: () => void;
  history: string[];
  setHistory: (string: string[]) => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  currentFilePath,
  similarFilesOpen,
  toggleSimilarFiles,
  history,
  setHistory,
}) => {
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electron.getPlatform();
      setPlatform(response);
    };

    fetchPlatform();
  }, []);

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
        />
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
