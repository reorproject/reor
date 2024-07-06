import React from "react";

import LLMSettingsContent from "./LLMSettingsContent";

const NormalLLMSettings: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-between bg-dark-gray-c-three rounded h-full">
      <LLMSettingsContent isInitialSetup={false} />
    </div>
  );
};

export default NormalLLMSettings;
