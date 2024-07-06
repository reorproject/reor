import React from "react";

import { Button } from "@material-tailwind/react";

import LLMSettingsContent from "./LLMSettingsContent";

import Modal from "@/components/Generic/Modal";

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

  return (
    <div className="w-full flex flex-col justify-between bg-dark-gray-c-three rounded">
      <div className="flex justify-between items-center border-b-2 border-solid border-neutral-700 border-0 py-1">
        <p className="mb-2 pb-3 text-gray-100">LLM</p>
        <Button
          className="flex justify-between items-center w-[80px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
          onClick={() => setIsSetupModalOpen(true)}
          placeholder=""
        >
          Setup
        </Button>
        <Modal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          widthName="newNote"
        >
          <LLMSettingsContent
            userHasCompleted={userHasCompleted}
            userTriedToSubmit={userTriedToSubmit}
            isInitialSetup={true}
          />
        </Modal>
      </div>
    </div>
  );
};

export default InitialSetupLLMSettings;
