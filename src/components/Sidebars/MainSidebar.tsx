import React, { useState } from "react";
import { FileSidebar } from "../File/FileSideBar";
import SearchComponent from "./FileSidebarSearch";
import { DBQueryResult } from "electron/main/database/Schema";
import { FileInfoTree } from "electron/main/Files/Types";

interface SidebarManagerProps {
  files: FileInfoTree;
  expandedDirectories: Map<string, boolean>;
  handleDirectoryToggle: (path: string) => void;
  selectedFilePath: string | null;
  onFileSelect: (path: string) => void;
  sidebarShowing: "files" | "search";
  noteToBeRenamed: string;
  setNoteToBeRenamed: (note: string) => void;
  fileDirToBeRenamed: string;
  setFileDirToBeRenamed: (dir: string) => void;
}

const SidebarManager: React.FC<SidebarManagerProps> = ({
  files,
  expandedDirectories,
  handleDirectoryToggle,
  selectedFilePath,
  onFileSelect,
  sidebarShowing,
  noteToBeRenamed,
  setNoteToBeRenamed,
  fileDirToBeRenamed,
  setFileDirToBeRenamed,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<DBQueryResult[]>([]);

  return (
    <div className="w-full">
      {sidebarShowing === "files" && (
        <FileSidebar
          files={files}
          expandedDirectories={expandedDirectories}
          handleDirectoryToggle={handleDirectoryToggle}
          selectedFilePath={selectedFilePath}
          onFileSelect={onFileSelect}
          noteToBeRenamed={noteToBeRenamed}
          setNoteToBeRenamed={setNoteToBeRenamed}
          fileDirToBeRenamed={fileDirToBeRenamed}
          setFileDirToBeRenamed={setFileDirToBeRenamed}
        />
      )}
      {sidebarShowing === "search" && (
        <SearchComponent
          onFileSelect={onFileSelect}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
        />
      )}
    </div>
  );
};

export default SidebarManager;
