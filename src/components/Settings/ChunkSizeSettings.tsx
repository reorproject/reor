import React, { useState, useEffect, ReactNode } from "react";

import posthog from "posthog-js";

import CustomSelect from "../Common/Select";

interface ChunkSizeSettingsProps {
  children?: ReactNode; // Define children prop
}

const ChunkSizeSettings: React.FC<ChunkSizeSettingsProps> = ({ children }) => {
  const [chunkSize, setChunkSize] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const defaultChunkSize = await window.electronStore.getChunkSize();
      if (defaultChunkSize) {
        setChunkSize(defaultChunkSize);
      } else {
        setChunkSize(500); // Default value
        window.electronStore.setChunkSize(500);
      }
    };

    fetchData();
  }, []);

  const handleChangeOnChunkSizeSelect = (size: string) => {
    const numberVersion = parseInt(size);
    setChunkSize(numberVersion);
    window.electronStore.setChunkSize(numberVersion);
    posthog.capture("change_chunk_size", {
      chunkSize: numberVersion,
    });
  };

  const possibleChunkSizes = Array.from(
    { length: 20 },
    (_, i) => (i + 1) * 100
  );

  return (
    <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2 pt-3">
      {children}
      {chunkSize && (
        <div className="w-[140px]">
          <CustomSelect
            options={possibleChunkSizes.map((num) => ({
              label: num.toString(),
              value: num.toString(),
            }))}
            selectedValue={chunkSize?.toString()}
            onChange={handleChangeOnChunkSizeSelect}
          />
        </div>
      )}
    </div>
  );
};

export default ChunkSizeSettings;
