import React, { useState, useEffect, ReactNode } from "react";
import CustomSelect from "../Generic/Select";

interface RagSettingsProps {
  children?: ReactNode; // Define children prop
}
const RagSettings: React.FC<RagSettingsProps> = ({ children }) => {
  const [noOfRAGExamples, setNoOfRAGExamples] = useState<number | null>();

  useEffect(() => {
    const defaultNoOfRAGExamples = window.electronStore.getNoOfRAGExamples();
    if (defaultNoOfRAGExamples) {
      setNoOfRAGExamples(defaultNoOfRAGExamples);
    } else {
      setNoOfRAGExamples(9);
      window.electronStore.setNoOfRAGExamples(9);
    }
  }, []);

  const handleChangeOnModelSelect = (ragExamples: string) => {
    const numberVersion = parseInt(ragExamples);
    setNoOfRAGExamples(numberVersion);
    window.electronStore.setNoOfRAGExamples(numberVersion);
  };

  const possibleNoOfExamples = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-gray-800 rounded pb-7">
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
