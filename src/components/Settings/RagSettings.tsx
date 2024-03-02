import React, { useState, useEffect, ReactNode } from "react";
import CustomSelect from "../Generic/Select";

interface RagSettingsProps {
  children?: ReactNode; // Define children prop
}
const RagSettings: React.FC<RagSettingsProps> = ({ children }) => {
  const [noOfRAGExamples, setNoOfRAGExamples] = useState<number | null>();

  useEffect(() => {
    const defaultNoOfRAGExamples = window.electronStore.getNoOfRAGExamples();
    if (defaultNoOfRAGExamples != null) {
      setNoOfRAGExamples(defaultNoOfRAGExamples);
    } else {
      setNoOfRAGExamples(15);
      window.electronStore.setNoOfRAGExamples(15);
    }
  }, []);

  const handleChange = (ragExamples: string) => {
    const numberVersion = parseInt(ragExamples);
    console.log("numberVersion:", numberVersion);
    setNoOfRAGExamples(numberVersion);
    window.electronStore.setNoOfRAGExamples(numberVersion);
  };

  const possibleNoOfExamples = Array.from({ length: 31 }, (_, i) => i);

  return (
    <div className="w-full bg-gray-800 rounded pb-7">
      {children}
      {noOfRAGExamples !== null && (
        <CustomSelect
          options={possibleNoOfExamples.map((num) => ({
            label: num.toString(),
            value: num.toString(),
          }))}
          value={noOfRAGExamples?.toString() ?? ""}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default RagSettings;
