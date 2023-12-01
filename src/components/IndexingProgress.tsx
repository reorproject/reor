import React, { useEffect, useState } from "react";
// import { ipcRenderer, IpcRendererEvent } from "electron";

interface IndexingProgressProps {
  onIndexingComplete: () => void;
}

const IndexingProgress: React.FC<IndexingProgressProps> = ({
  onIndexingComplete,
}) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const handleProgressUpdate = (newProgress: number) => {
      console.log("CALLING INDEXING", newProgress);
      if (newProgress >= 1) {
        console.log("CALLING INDEXING COMPLETE");
        onIndexingComplete();
      }
      setProgress(newProgress);
    };
    window.ipcRenderer.receive("indexing-progress", handleProgressUpdate);
    // window.ipcRenderer.on("indexing-progress", handleProgressUpdate);

    return () => {
      window.ipcRenderer.removeListener(
        "indexing-progress",
        handleProgressUpdate
      );
    };
  }, [onIndexingComplete]);

  return (
    <div>
      <h2>Indexing Database...</h2>
      <progress value={progress} max="1"></progress>
    </div>
  );
};

export default IndexingProgress;
