import React, { useEffect, useState } from "react";
import Modal from "./Generic/Modal";
import CircularProgress from "@mui/material/CircularProgress";

interface IndexingProgressProps {
  indexingProgress: number;
}

const IndexingProgress: React.FC<IndexingProgressProps> = ({
  indexingProgress,
}) => {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [eta, setEta] = useState<string>("Initializing...");

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (indexingProgress > 0) {
      const elapsedTime = Date.now() - startTime;
      const estimatedTotalTime = elapsedTime / indexingProgress;
      const remainingTime = estimatedTotalTime - elapsedTime;

      const etaMinutes = Math.floor(remainingTime / 60000);
      const etaSeconds = Math.floor((remainingTime % 60000) / 1000);
      setEta(`${etaMinutes}m ${etaSeconds}s remaining`);
    }
  }, [indexingProgress, startTime]);

  return (
    <Modal
      isOpen={true}
      onClose={() => console.log("Not allowing a close for now")}
      hideCloseButton={true}
    >
      <div className="w-[500px] h-[100px] ml-3 mb-3 mt-2">
        <h6 className="mt-2 mb-2 text-2xl font-semibold text-white">
          {indexingProgress === 0
            ? "Initializing vector database..."
            : "Indexing files..."}
        </h6>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-2 border-2 border-gray-400">
          <div
            className="bg-blue-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${indexingProgress * 100}%` }}
          ></div>
        </div>
        <div className="flex">
          {indexingProgress == 0 && (
            <CircularProgress
              size={20}
              thickness={7}
              style={{ color: "white" }}
              className="mr-2"
            />
          )}

          <span className="text-sm text-white font-semibold">
            {indexingProgress > 0 && (
              <>{Math.round(indexingProgress * 100)}% -</>
            )}{" "}
            {eta}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default IndexingProgress;
