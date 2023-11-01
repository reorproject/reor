// FileEditor.tsx
import React, { useEffect, useState } from "react";

interface FileEditorProps {
  filePath: string;
}

export const FileEditor: React.FC<FileEditorProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const fetchContent = async () => {
      const fileContent = await window.ipcRenderer.invoke(
        "read-file",
        filePath
      );
      setContent(fileContent);
    };

    if (filePath) {
      fetchContent();
    }
  }, [filePath]);

  const saveFile = async () => {
    await window.ipcRenderer.invoke("write-file", filePath, content);
  };

  return (
    <div className="p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 border p-2"
      />
      <button onClick={saveFile} className="mt-4 bg-blue-500 text-white p-2">
        Save
      </button>
    </div>
  );
};
