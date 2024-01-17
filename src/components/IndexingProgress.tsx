import React, { useEffect, useState } from "react";
import Modal from "./Generic/Modal";
import CircularProgress from "@mui/material/CircularProgress";

// import { ipcRenderer, IpcRendererEvent } from "electron";

interface IndexingProgressProps {
  onIndexingComplete: () => void;
}
// Other imports...

const IndexingProgress: React.FC<IndexingProgressProps> = ({
  onIndexingComplete,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [eta, setEta] = useState<string>("Calculating...");

  useEffect(() => {
    setStartTime(Date.now()); // Set the start time when the component mounts

    const handleProgressUpdate = (newProgress: number) => {
      if (newProgress >= 1) {
        onIndexingComplete();
      }
      setProgress(newProgress);

      // Update ETA
      if (newProgress > 0) {
        const elapsedTime = Date.now() - startTime;
        const estimatedTotalTime = elapsedTime / newProgress;
        const remainingTime = estimatedTotalTime - elapsedTime;

        const etaMinutes = Math.floor(remainingTime / 60000);
        const etaSeconds = Math.floor((remainingTime % 60000) / 1000);
        setEta(`${etaMinutes}m ${etaSeconds}s remaining`);
      }
    };

    window.ipcRenderer.receive("indexing-progress", handleProgressUpdate);

    return () => {
      window.ipcRenderer.removeListener(
        "indexing-progress",
        handleProgressUpdate
      );
    };
  }, [onIndexingComplete, startTime]);

  return (
    <Modal
      isOpen={true}
      onClose={() => console.log("Not allowing a close for now")}
      hideCloseButton={true}
    >
      <div className="w-[500px] h-[100px]">
        <h6 className="mt-2 mb-2 text-2xl font-semibold text-white">
          {progress === 0
            ? "Initializing vector database..."
            : "Indexing files..."}
        </h6>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-2 border-2 border-gray-400">
          <div
            className="bg-blue-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
        <div className="flex">
          {progress == 0 && (
            <CircularProgress
              size={20}
              thickness={7}
              style={{ color: "white" }}
              className="mr-2"
            />
          )}

          <span className="text-sm text-white font-semibold">
            {progress > 0 && <>{Math.round(progress * 100)}% -</>} {eta}
          </span>
        </div>
      </div>
    </Modal>
  );
};

// export default IndexingProgress;

// interface ProgressBarProps {
//   progress: number;
// }

// const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
//   const getProgressState = () => {
//     if (progress <= 25) {
//       return { color: "blue", emoji: "🙂" };
//     } else if (progress <= 50) {
//       return { color: "yellow", emoji: "😅" };
//     } else if (progress <= 75) {
//       return { color: "orange", emoji: "🤞" };
//     } else {
//       return { color: "green", emoji: "🎉" };
//     }
//   };

//   const { color, emoji } = getProgressState();

//   return (
//     <div className="w-full bg-gray-200 rounded-full overflow-hidden relative">
//       <div
//         className={`absolute top-0 left-0 h-full text-xs font-medium text-black text-center p-0.5 leading-none rounded-full transition-all duration-300 ease-in-out ${
//           color === "blue" ? "bg-blue-500" : ""
//         } ${color === "yellow" ? "bg-yellow-500" : ""} ${
//           color === "orange" ? "bg-orange-500" : ""
//         } ${color === "green" ? "bg-green-500" : ""}`}
//         style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
//       >
//         {progress}% {emoji}
//       </div>
//     </div>
//   );
// };

export default IndexingProgress;
