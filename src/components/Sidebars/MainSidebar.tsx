import { DBResult } from "electron/main/database/LanceTableWrapper";
import React, { useState } from "react";
import { FileSidebar } from "../File/FileSidebar";
import SearchComponent from "./FileSidebarSearch";

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
  const [searchResults, setSearchResults] = useState<DBResult[]>([]);

  return (
    <div className="w-full">
      {sidebarShowing === "files" && (
        <FileSidebar
          selectedFile={selectedFilePath}
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
