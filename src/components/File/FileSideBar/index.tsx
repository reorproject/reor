import { FileInfoNode, FileInfoTree } from "electron/main/Files/Types";
import React, { useEffect, useState } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { isFileNodeDirectory } from "./fileOperations";
import { FileItem } from "./FileItem";

interface FileListProps {
  files: FileInfoTree;
  expandedDirectories: Map<string, boolean>;
  handleDirectoryToggle: (path: string) => void;
  selectedFilePath: string | null;
  onFileSelect: (path: string) => void;
  listHeight?: number;
}

export const FileSidebar: React.FC<FileListProps> = ({
  files,
  expandedDirectories,
  handleDirectoryToggle,
  selectedFilePath,
  onFileSelect,
  listHeight,
}) => {
  return (
    <div
      className={`flex flex-col h-below-titlebar text-white overflow-x-hidden`}
    >
      <FileExplorer
        files={files}
        selectedFilePath={selectedFilePath}
        onFileSelect={onFileSelect}
        handleDragStart={handleDragStartImpl}
        expandedDirectories={expandedDirectories}
        handleDirectoryToggle={handleDirectoryToggle}
        lheight={listHeight}
      />
    </div>
  );
};

const handleDragStartImpl = (e: React.DragEvent, file: FileInfoNode) => {
  e.dataTransfer.setData("text/plain", file.path);
  e.dataTransfer.effectAllowed = "move";
};

interface FileExplorerProps {
  files: FileInfoTree;
  selectedFilePath: string | null;
  onFileSelect: (path: string) => void;
  handleDragStart: (e: React.DragEvent, file: FileInfoNode) => void;
  expandedDirectories: Map<string, boolean>;
  handleDirectoryToggle: (path: string) => void;
  lheight?: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFilePath,
  onFileSelect,
  handleDragStart,
  expandedDirectories,
  handleDirectoryToggle,
  lheight,
}) => {
  const [listHeight, setListHeight] = useState(lheight ?? window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(lheight ?? window.innerHeight);
    };

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const getVisibleFilesAndFlatten = (
    files: FileInfoTree,
    expandedDirectories: Map<string, boolean>,
    indentMultiplyer = 0
  ): { file: FileInfoNode; indentMultiplyer: number }[] => {
    let visibleItems: { file: FileInfoNode; indentMultiplyer: number }[] = [];
    files.forEach((file) => {
      const a = { file, indentMultiplyer };
      visibleItems.push(a);
      if (
        isFileNodeDirectory(file) &&
        expandedDirectories.has(file.path) &&
        expandedDirectories.get(file.path)
      ) {
        if (file.children) {
          visibleItems = [
            ...visibleItems,
            ...getVisibleFilesAndFlatten(
              file.children,
              expandedDirectories,
              indentMultiplyer + 1
            ),
          ];
        }
      }
    });
    return visibleItems;
  };

  // Calculate visible items and item count
  const visibleItems = getVisibleFilesAndFlatten(files, expandedDirectories);
  const itemCount = visibleItems.length;

  const Rows: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const fileObject = visibleItems[index];

    return (
      <div style={style}>
        <FileItem
          file={fileObject.file}
          selectedFilePath={selectedFilePath}
          onFileSelect={onFileSelect}
          handleDragStart={handleDragStart}
          onDirectoryToggle={handleDirectoryToggle}
          isExpanded={
            expandedDirectories.has(fileObject.file.path) &&
            expandedDirectories.get(fileObject.file.path)
          }
          indentMultiplyer={fileObject.indentMultiplyer}
        />
      </div>
    );
  };

  return (
    <List
      height={listHeight}
      itemCount={itemCount}
      itemSize={30}
      width={"100%"}
      style={{ padding: 0, margin: 0 }}
    >
      {Rows}
    </List>
  );
};
