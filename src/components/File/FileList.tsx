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
      // Fetch files logic here
      const fetchedFiles = await window.files.getFiles();
      setFiles(fetchedFiles);
    };
    fetchFiles();
  }, []);

  return (
    <div className="flex flex-col bg-gray-900 text-white h-screen">
      <div className="overflow-y-auto">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => onFileSelect(file.path)}
            className="text-white py-2 border-0 transition-colors duration-150 ease-in-out w-full bg-transparent focus:outline-none hover:bg-gray-800"
          >
            <span className="truncate">{file.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
