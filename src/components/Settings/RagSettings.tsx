import React, { useState, useEffect, ReactNode } from "react";
import CustomSelect from "../Generic/Select";

interface RagSettingsProps {
  children?: ReactNode; // Define children prop
}
const RagSettings: React.FC<RagSettingsProps> = ({ children }) => {
  const [noOfRAGExamples, setNoOfRAGExamples] = useState<number | null>();

  useEffect(() => {
    const fetchData = async () => {
      const defaultNoOfRAGExamples =
        await window.electronStore.getNoOfRAGExamples();
      if (defaultNoOfRAGExamples) {
        setNoOfRAGExamples(defaultNoOfRAGExamples);
      } else {
        setNoOfRAGExamples(15);
        window.electronStore.setNoOfRAGExamples(15);
      }
    };

    fetchData();
  }, []);

  const handleChangeOnModelSelect = (ragExamples: string) => {
    const numberVersion = parseInt(ragExamples);
    setNoOfRAGExamples(numberVersion);
    window.electronStore.setNoOfRAGExamples(numberVersion);
  };

  const possibleNoOfExamples = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-neutral-800 rounded pb-7">
      {children}
      {noOfRAGExamples && (
        <CustomSelect
          options={possibleNoOfExamples.map((num) => ({
            label: num.toString(),
            value: num.toString(),
          }))}
          value={noOfRAGExamples?.toString()}
          onChange={handleChangeOnModelSelect}
        />
      )}
    </div>
  );
};

export default RagSettings;
