import React from "react";

import { CheckCircleIcon, CogIcon } from "@heroicons/react/24/solid";
import { Button } from "@material-tailwind/react";

import useLLMConfigs from "./hooks/useLLMConfigs";
import LLMSettingsContent from "./LLMSettingsContent";

import ReorModal from "@/components/Common/Modal";

interface InitialSetupLLMSettingsProps {
  userHasCompleted?: (completed: boolean) => void;
  userTriedToSubmit?: boolean;
}

const InitialSetupLLMSettings: React.FC<InitialSetupLLMSettingsProps> = ({
  userHasCompleted,
  userTriedToSubmit,
}) => {
  const [isSetupModalOpen, setIsSetupModalOpen] =
    React.useState<boolean>(false);
  const { llmConfigs, fetchAndUpdateModelConfigs } = useLLMConfigs();

  React.useEffect(() => {
    if (llmConfigs.length > 0) {
      userHasCompleted?.(true);
    }
  }, [llmConfigs, userHasCompleted]);

  const isSetupComplete = llmConfigs.length > 0;

  return (
    <div className="w-full flex flex-col justify-between bg-dark-gray-c-three rounded">
      <div className="flex justify-between items-center border-b-2 border-solid border-neutral-700 border-0 py-1">
        <p className="mb-2 pb-3 text-gray-100">LLM</p>
        <Button
          className={`flex justify-between items-center py-2 px-3 border border-gray-300 rounded-md border-none cursor-pointer ${
            isSetupComplete
              ? "bg-green-700 hover:bg-green-800 text-white"
              : "bg-dark-gray-c-eight hover:bg-dark-gray-c-ten"
          } font-normal transition-colors duration-200`}
          onClick={() => setIsSetupModalOpen(true)}
          placeholder=""
        >
          {isSetupComplete ? (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              <span>Setup</span>
            </>
          ) : (
            <>
              <CogIcon className="w-5 h-5 mr-2" />
              <span>Setup</span>
            </>
          )}
        </Button>
        <ReorModal
          isOpen={isSetupModalOpen}
          onClose={() => {
            setIsSetupModalOpen(false);
            fetchAndUpdateModelConfigs();
          }}
          width="500px"
        >
          <LLMSettingsContent
            userHasCompleted={userHasCompleted}
            userTriedToSubmit={userTriedToSubmit}
            isInitialSetup={true}
          />
        </ReorModal>
      </div>
      {userTriedToSubmit && llmConfigs.length === 0 && (
        <p className="text-red-500 text-sm mt-1">
          Please set up at least one LLM.
        </p>
      )}
    </div>
  );
};

export default InitialSetupLLMSettings;
