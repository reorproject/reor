import React, { useState } from "react";

export interface RagnoteDBEntry {
  notepath: string;
  vector?: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
}

interface NewNoteComponentProps {
  onFileSelect: (path: string) => void;
}

const NewNoteComponent: React.FC<NewNoteComponentProps> = ({
  onFileSelect,
}) => {
  const [fileName, setFileName] = useState<string>("");

  const sendNewNoteMsg = async () => {
    const notePath = await window.files.joinPath(
      window.electronStore.getUserDirectory(),
      fileName
    );
    console.log("NEW NOTE PATH: ", notePath);
    window.files.createFile(notePath, "");
    onFileSelect(notePath);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendNewNoteMsg();
    }
  };

  return (
    <div className="flex relative p-0.5">
      <input
        type="text"
        className="border border-gray-300 rounded-md p-2 w-full h-[7px]"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Name"
      />
      <div onClick={sendNewNoteMsg}>Create</div>
    </div>
  );
};

export default NewNoteComponent;
