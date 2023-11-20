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
      <FileExplorer files={files} onFileSelect={onFileSelect} />
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

interface FileExplorerProps {
  files: FileInfo[];
  onFileSelect: (path: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  return (
    <div>
      {files.map((file) => (
        <FileItem key={file.path} file={file} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
};

interface FileInfoProps {
  file: FileInfo;
  onFileSelect: (path: string) => void;
}

const FileItem: React.FC<FileInfoProps> = ({ file, onFileSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDirectory = file.type === "directory";

  const toggle = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(file.path);
    }
  };

  return (
    <div>
      <div
        onClick={toggle}
        // style={{ cursor: isDirectory ? "pointer" : "default" }}
        className="cursor-pointer"
      >
        {file.name}
      </div>
      {isDirectory && isExpanded && file.children && (
        <div style={{ paddingLeft: "20px" }}>
          <FileExplorer files={file.children} onFileSelect={onFileSelect} />
        </div>
      )}
    </div>
  );
};
