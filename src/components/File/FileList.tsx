import { FileInfo } from "electron/main/Files/Types";
import React, { useEffect, useState } from "react";

interface FileListProps {
  onFileSelect: (path: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);

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
        onFileSelect={onFileSelect}
        handleDragStart={handleDragStartImpl}
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
  console.log(
    "handle drag start event: ",
    e.dataTransfer.getData("text/plain")
  );
};
interface FileExplorerProps {
  files: FileInfo[];
  onFileSelect: (path: string) => void;
  handleDragStart: (e: React.DragEvent, file: FileInfo) => void;
}

const moveFileDummy = (path: string, destinationPath: string) => {
  console.log("MOVED FROM PATH: ", path);
  console.log("DESTINATION PATH: ", destinationPath);
};

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  onFileSelect,
  handleDragStart,
}) => {
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    destinationPath: string
  ) => {
    e.preventDefault();
    const sourcePath = e.dataTransfer.getData("text/plain"); // This is correct

    moveFileDummy(sourcePath, destinationPath);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      {files.map((file) => (
        <div
          onDrop={(e) => handleDrop(e, file.path)}
          onDragOver={handleDragOver}
          key={file.path}
        >
          <FileItem
            file={file}
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
  onFileSelect: (path: string) => void;
  handleDragStart: (e: React.DragEvent, file: FileInfo) => void;
}

const FileItem: React.FC<FileInfoProps> = ({
  file,
  onFileSelect,
  handleDragStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = file.type === "directory";

  const toggle = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(file.path);
    }
  };

  const localHandleDragStart = (e: React.DragEvent) => {
    e.stopPropagation(); // Prevent event bubbling up
    handleDragStart(e, file);
  };

  return (
    <div draggable onDragStart={localHandleDragStart}>
      <div onClick={toggle} className="cursor-pointer">
        {file.name}
      </div>
      {isDirectory && isExpanded && file.children && (
        <div style={{ paddingLeft: "20px" }}>
          <FileExplorer
            files={file.children}
            onFileSelect={onFileSelect}
            handleDragStart={handleDragStart}
          />
        </div>
      )}
    </div>
  );
};
