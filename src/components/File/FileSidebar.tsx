import { removeFileExtension } from "@/functions/strings";
import { FileInfoNode, FileInfoTree } from "electron/main/Files/Types";
import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

interface FileListProps {
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  windowVaultDirectory: string;
}

export const FileSidebar: React.FC<FileListProps> = ({
  selectedFile,
  onFileSelect,
  windowVaultDirectory,
}) => {
  const [files, setFiles] = useState<FileInfoTree>([]);

  const sortFilesAndDirectories = (fileList: FileInfoTree): FileInfoTree => {
    fileList.sort((a, b) => {
      const aIsDirectory = isFileNodeDirectory(a);
      const bIsDirectory = isFileNodeDirectory(b);

      // Both are directories: sort alphabetically
      if (aIsDirectory && bIsDirectory) {
        return a.name.localeCompare(b.name);
      }

      // One is a directory and the other is a file
      if (aIsDirectory && !bIsDirectory) {
        return -1;
      }
      if (!aIsDirectory && bIsDirectory) {
        return 1;
      }

      // Both are files: sort by dateModified
      return b.dateModified.getTime() - a.dateModified.getTime();
    });

    fileList.forEach((fileInfoNode) => {
      // If a node has children, sort them recursively
      if (fileInfoNode.children && fileInfoNode.children.length > 0) {
        sortFilesAndDirectories(fileInfoNode.children);
      }
    });

    return fileList;
  };

  useEffect(() => {
    const handleFileUpdate = (updatedFiles: FileInfoTree) => {
      const sortedFiles = sortFilesAndDirectories(updatedFiles);
      setFiles(sortedFiles);
    };

    window.ipcRenderer.receive("files-list", handleFileUpdate);

    return () => {
      window.ipcRenderer.removeListener("files-list", handleFileUpdate);
    };
  }, []);

  useEffect(() => {
    window.files.getFiles(windowVaultDirectory).then((fetchedFiles) => {
      const sortedFiles = sortFilesAndDirectories(fetchedFiles);
      setFiles(sortedFiles);
    });
  }, []);

  return (
    <div className="flex flex-col h-below-titlebar text-white overflow-y-auto overflow-x-hidden">
      <FileExplorer
        files={files}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        handleDragStart={handleDragStartImpl}
        directoryPath={windowVaultDirectory}
      />
    </div>
  );
};

const handleDragStartImpl = (e: React.DragEvent, file: FileInfoNode) => {
  e.dataTransfer.setData("text/plain", file.path);
  e.dataTransfer.effectAllowed = "move";
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

  const getVisibleFilesAndFlatten = (
    files: FileInfoTree,
    expandedDirectories: string[],
    indentMultiplyer = 0
  ): { file: FileInfoNode; indentMultiplyer: number }[] => {
    let visibleItems: { file: FileInfoNode; indentMultiplyer: number }[] = [];
    files.forEach((file) => {
      const a = { file, indentMultiplyer };
      visibleItems.push(a);
      if (
        isFileNodeDirectory(file) &&
        expandedDirectories.includes(file.path)
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
  const visibleItems = getVisibleFilesAndFlatten(files, expandedDirectories);
  const itemCount = visibleItems.length;

  const Row: React.FC<ListChildComponentProps> = ({ index, style }) => {
    const fileObject = visibleItems[index];

    return (
      <div style={style}>
        <FileItem
          file={fileObject.file}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          handleDragStart={handleDragStart}
          onDirectoryToggle={handleDirectoryToggle}
          isExpanded={expandedDirectories.includes(fileObject.file.path)}
          indentMultiplyer={fileObject.indentMultiplyer}
        />
      </div>
    );
  };

  return (
    <List
      height={listHeight}
      itemCount={itemCount}
      itemSize={30} // Adjust based on your item size
      width={"100%"}
      // set style to set margin and padding to 0:
      style={{ padding: 0, margin: 0 }}
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
  indentMultiplyer?: number;
}
const FileItem: React.FC<FileInfoProps> = ({
  file,
  selectedFile,
  onFileSelect,
  handleDragStart,
  onDirectoryToggle,
  isExpanded,
  indentMultiplyer,
}) => {
  // const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = isFileNodeDirectory(file);
  const isSelected = file.path === selectedFile;
  const indentation = indentMultiplyer ? 10 * indentMultiplyer : 0;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false); // Reset drag over state
    const sourcePath = e.dataTransfer.getData("text/plain");
    let destinationPath = file.path; // Default destination path is the path of the file item itself

    if (!isFileNodeDirectory(file)) {
      // If the file is not a directory, get the parent directory path
      const pathSegments = file.path.split("/");
      pathSegments.pop(); // Remove the file name
      destinationPath = pathSegments.join("/"); // Rejoin to get the parent directory path
    }

    try {
      moveFile(sourcePath, destinationPath);
      // Refresh file list here or in moveFile function
    } catch (error) {
      console.error("Failed to move file:", error);
      // Handle error (e.g., show an error message)
    }
  };
  const toggle = () => {
    if (isFileNodeDirectory(file)) {
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

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-slate-700 h-full mt-0 mb-0 ${
    isSelected ? "bg-gray-700 text-white font-semibold" : "text-gray-200"
  } ${isDragOver ? "bg-blue-500" : ""}`;

  return (
    <div
      draggable
      onDragStart={localHandleDragStart}
      onContextMenu={handleContextMenu}
      style={{ paddingLeft: `${indentation}px` }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <div onClick={toggle} className={itemClasses}>
        {isDirectory && (
          <span className={`mr-2 mt-1 text-[13px] `}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
        <span
          className={`text-[13px] flex-1 truncate mt-0 ${
            isDirectory ? "font-semibold" : ""
          }`}
        >
          {removeFileExtension(file.name)}
        </span>
      </div>
    </div>
  );
};

export const isFileNodeDirectory = (fileInfo: FileInfoNode): boolean => {
  return fileInfo.children !== undefined;
};
