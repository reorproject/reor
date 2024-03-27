import React, { useState } from "react";
import { FileSidebar } from "../File/FileSideBar";
import SearchComponent from "./FileSidebarSearch";
import { DBQueryResult } from "electron/main/database/Schema";

interface SidebarManagerProps {
  selectedFilePath: string | null;
  onFileSelect: (path: string) => void;
  sidebarShowing: "files" | "search";
}

const SidebarManager: React.FC<SidebarManagerProps> = ({
  selectedFilePath,
  onFileSelect,
  sidebarShowing,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<DBQueryResult[]>([]);

  return (
    <div className="w-full">
      {sidebarShowing === "files" && (
        <FileSidebar
          selectedFilePath={selectedFilePath}
          onFileSelect={onFileSelect}
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
