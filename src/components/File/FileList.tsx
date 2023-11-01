// FileList.tsx
import React, { useEffect, useState } from "react";

interface FileInfo {
  name: string;
  path: string;
}

interface FileListProps {
  onFileSelect: (path: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const fetchedFiles = await window.ipcRenderer.invoke("get-files");
      setFiles(fetchedFiles);
    };
    fetchFiles();
  }, []);

  return (
    <div className="p-4">
      {files.map((file, index) => (
        <button
          key={index}
          onClick={() => onFileSelect(file.path)}
          className="border p-2 mb-2 w-full"
        >
          {file.name}
        </button>
      ))}
    </div>
  );
};
