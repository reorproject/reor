import { FileInfo } from "electron/main/Files/Types";
import React, { useEffect, useState } from "react";

interface FileListProps {
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  selectedFile,
  onFileSelect,
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);

  const directoryPath = window.electronStore.getUserDirectory();

  useEffect(() => {
    const handleFileUpdate = (updatedFiles: FileInfo[], _: FileInfo[]) => {
      updatedFiles.sort(
        (a, b) => b.dateModified.getTime() - a.dateModified.getTime()
      );
      setFiles(updatedFiles);
    };

    window.ipcRenderer.receive("files-list", handleFileUpdate);

    return () => {
      window.ipcRenderer.removeListener("files-list", handleFileUpdate);
    };
  }, []);

  // so we also will need to now somehow get access to the user directory and display. Or maybe we shove in relative path as the name instead of name...and see what happens

  return (
    <div className="flex flex-col bg-gray-900 text-white h-full overflow-y-auto overflow-x-hidden">
      {/* <button
        onClick={createNewFile}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create New File
      </button> */}
      <FileExplorer
        files={files}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
        handleDragStart={handleDragStartImpl}
        directoryPath={directoryPath}
      />
      {/* {files.map((file, index) => (
        <button
          key={index}
          onClick={() => {
            console.log("FILE SELECTED: ", file.path);
            onFileSelect(file.path);
          }}
          className="text-white py-2 border-0 transition-colors duration-150 ease-in-out w-full bg-transparent focus:outline-none hover:bg-gray-800"
        >
          <span className="truncate">{file.relativePath}</span>
        </button>
      ))} */}
    </div>
  );
};

const handleDragStartImpl = (e: React.DragEvent, file: FileInfo) => {
  e.dataTransfer.setData("text/plain", file.path);
  e.dataTransfer.effectAllowed = "move";
  // console.log(
  //   "handle drag start event: ",
  //   e.dataTransfer.getData("text/plain")
  // );
};

const moveFile = async (sourcePath: string, destinationPath: string) => {
  const result = await window.files.moveFileOrDir(sourcePath, destinationPath);
};

interface FileExplorerProps {
  files: FileInfo[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  handleDragStart: (e: React.DragEvent, file: FileInfo) => void;
  directoryPath: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  selectedFile,
  onFileSelect,
  handleDragStart,
  directoryPath,
}) => {
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    destinationPath: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const sourcePath = e.dataTransfer.getData("text/plain"); // This is correct

    moveFile(sourcePath, destinationPath);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className="h-full"
      onDrop={(e) => handleDrop(e, directoryPath)}
      onDragOver={handleDragOver}
    >
      {files.map((file) => (
        <div
          onDrop={(e) => handleDrop(e, file.path)}
          onDragOver={handleDragOver}
          key={file.path}
        >
          <FileItem
            file={file}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            handleDragStart={handleDragStart}
          />
        </div>
      ))}
    </div>
  );
};
interface FileInfoProps {
  file: FileInfo;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  handleDragStart: (e: React.DragEvent, file: FileInfo) => void;
}

const FileItem: React.FC<FileInfoProps> = ({
  file,
  selectedFile,
  onFileSelect,
  handleDragStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = file.type === "directory";
  const isSelected = file.path === selectedFile; // Check if the file is selected

  const toggle = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(file.path);
    }
  };

  const localHandleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    handleDragStart(e, file);
  };

  const itemClasses = `flex items-center cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-100 ${
    isSelected ? "bg-blue-100 font-bold" : "" // Tailwind classes for selected item
  }`;

  return (
    <div draggable onDragStart={localHandleDragStart}>
      <div onClick={toggle} className={itemClasses}>
        {isDirectory && (
          <span
            className={`mr-2 text-sm ${
              isExpanded ? "transform rotate-90" : ""
            }`}
          >
            {">"}
          </span>
        )}
        <span className={`flex-1 ${isDirectory ? "font-semibold" : ""}`}>
          {file.name}
        </span>
      </div>
      {isDirectory && isExpanded && file.children && (
        <div className="pl-5">
          <FileExplorer
            files={file.children}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            handleDragStart={handleDragStart}
            directoryPath={file.path}
          />
        </div>
      )}
    </div>
  );
};
