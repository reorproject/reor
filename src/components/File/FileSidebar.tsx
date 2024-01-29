import { removeFileExtension } from "@/functions/strings";
import { FileInfoNode, FileInfoTree } from "electron/main/Files/Types";
import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

interface FileListProps {
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

export const FileSidebar: React.FC<FileListProps> = ({
  selectedFile,
  onFileSelect,
}) => {
  const [files, setFiles] = useState<FileInfoTree>([]);

  const directoryPath = window.electronStore.getUserDirectory();

  useEffect(() => {
    const handleFileUpdate = (updatedFiles: FileInfoTree) => {
      updatedFiles.sort((a, b) => {
        // if (a.type === "directory" && b.type !== "directory") {
        //   return -1;
        // }
        // if (a.type !== "directory" && b.type === "directory") {
        //   return 1;
        // }
        return b.dateModified.getTime() - a.dateModified.getTime();
      });
      setFiles(updatedFiles);
    };

    window.ipcRenderer.receive("files-list", handleFileUpdate);

    return () => {
      window.ipcRenderer.removeListener("files-list", handleFileUpdate);
    };
  }, []);

  useEffect(() => {
    window.files.getFiles().then((files) => {
      files.sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());
      setFiles(files);
    });
  }, []);
  return (
    <div
      className="flex flex-col text-white overflow-y-auto overflow-x-hidden"
      style={{ height: "calc(100vh - 33px)" }}
    >
      <FileExplorer
        files={files}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        handleDragStart={handleDragStartImpl}
        directoryPath={directoryPath}
      />
    </div>
  );
};

const handleDragStartImpl = (e: React.DragEvent, file: FileInfoNode) => {
  e.dataTransfer.setData("text/plain", file.path);
  e.dataTransfer.effectAllowed = "move";
  // console.log(
  //   "handle drag start event: ",
  //   e.dataTransfer.getData("text/plain")
  // );
};

export const moveFile = async (sourcePath: string, destinationPath: string) => {
  await window.files.moveFileOrDir(sourcePath, destinationPath);
};

interface FileExplorerProps {
  files: FileInfoTree;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  handleDragStart: (e: React.DragEvent, file: FileInfoNode) => void;
  directoryPath: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFile,
  onFileSelect,
  handleDragStart,
}) => {
  const [listHeight, setListHeight] = useState(window.innerHeight);
  const [expandedDirectories, setExpandedDirectories] = useState<string[]>([]);

  useEffect(() => {
    const updateHeight = () => {
      setListHeight(window.innerHeight);
    };

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const getVisibleItems = (
    files: FileInfoTree,
    expandedDirectories: string[]
  ) => {
    let visibleItems: FileInfoTree = [];
    files.forEach((file) => {
      visibleItems.push(file);
      if (
        file.type === "directory" &&
        expandedDirectories.includes(file.path)
      ) {
        if (file.children) {
          visibleItems = [
            ...visibleItems,
            ...getVisibleItems(file.children, expandedDirectories),
          ];
        }
      }
    });
    return visibleItems;
  };

  const handleDirectoryToggle = (path: string) => {
    setExpandedDirectories((prev) => {
      if (prev.includes(path)) {
        return prev.filter((p) => p !== path); // Remove the path if it's already expanded
      } else {
        return [...prev, path]; // Add the path if it's not yet expanded
      }
    });
  };

  // Calculate visible items and item count
  const visibleItems = getVisibleItems(files, expandedDirectories);
  const itemCount = visibleItems.length;

  const Row: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const file = visibleItems[index];
    return (
      <div style={style}>
        <FileItem
          file={file}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          handleDragStart={handleDragStart}
          onDirectoryToggle={handleDirectoryToggle}
          isExpanded={expandedDirectories.includes(file.path)}
        />
      </div>
    );
  };

  return (
    <List
      height={listHeight}
      itemCount={itemCount}
      itemSize={35} // Adjust based on your item size
      width={"100%"}
    >
      {Row}
    </List>
  );
};
interface FileInfoProps {
  file: FileInfoNode;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  handleDragStart: (e: React.DragEvent, file: FileInfoNode) => void;
  onDirectoryToggle: (path: string) => void;
  isExpanded?: boolean;
}
const FileItem: React.FC<FileInfoProps> = ({
  file,
  selectedFile,
  onFileSelect,
  handleDragStart,
  onDirectoryToggle,
  isExpanded,
}) => {
  // const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = file.type === "directory";
  const isSelected = file.path === selectedFile;

  const toggle = () => {
    if (file.type === "directory") {
      // setIsExpanded(!isExpanded);
      onDirectoryToggle(file.path);
    } else {
      onFileSelect(file.path);
    }
  };

  const localHandleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    handleDragStart(e, file);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.contextMenu.showFileItemContextMenu(file);
  };

  const itemClasses = `flex items-center cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 ${
    isSelected ? "bg-gray-700 text-white font-semibold" : "text-gray-200"
  }`;

  return (
    <div
      draggable
      onDragStart={localHandleDragStart}
      onContextMenu={handleContextMenu}
    >
      <div onClick={toggle} className={itemClasses}>
        {isDirectory && (
          <span className={`mr-2 text-sm `}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
        <span
          className={`text-sm flex-1 truncate ${
            isDirectory ? "font-semibold" : ""
          }`}
        >
          {removeFileExtension(file.name)}
        </span>
      </div>
    </div>
  );
};
