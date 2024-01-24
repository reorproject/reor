import React, { useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import LLMSettings from "./LLMSettings";
import EmbeddingModelManager from "./EmbeddingSettings";
import DirectoryPicker from "./DirectoryPicker";

interface Props {
  initialSettingsAreReady: () => void;
}

const InitialSetupSettings: React.FC<Props> = ({ initialSettingsAreReady }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [nextPageAllowed, setNextPageAllowed] = useState(false);
  const [userTriedToSubmit, setUserTriedToSubmit] = useState<boolean>(false);

  const handleNext = () => {
    setUserTriedToSubmit(true);
    if (currentStep < 3 && nextPageAllowed) {
      setCurrentStep(currentStep + 1);
      setNextPageAllowed(false);
    } else {
      if (nextPageAllowed) {
        initialSettingsAreReady();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setNextPageAllowed(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => console.log("Not allowing a close for now")}
      hideCloseButton={true}
    >
      <div className="w-full mr-3">
        <div className="ml-2 mt-0 h-full">
          {currentStep === 1 && (
            <DirectoryPicker
              userHasCompleted={(allowed) => setNextPageAllowed(allowed)}
              userTriedToSubmit={userTriedToSubmit}
            />
          )}
          {currentStep === 2 && (
            <>
              <EmbeddingModelManager
                userHasCompleted={(completed) => setNextPageAllowed(completed)}
                userTriedToSubmit={userTriedToSubmit}
              />
            </>
          )}
          {currentStep === 3 && (
            <>
              <LLMSettings
                userHasCompleted={(completed) => setNextPageAllowed(completed)}
                userTriedToSubmit={userTriedToSubmit}
              />
            </>
          )}
          <div className="flex justify-between mt-5">
            {currentStep > 1 ? (
              <Button
                className="bg-slate-700 mb-3 border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center"
                onClick={handleBack}
                placeholder=""
              >
                Back
              </Button>
            ) : (
              <div className="flex-grow"></div>
            )}
            {/* {nextPageAllowed && ( */}
            <Button
              className="bg-slate-700 mb-3 border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center"
              onClick={handleNext}
              placeholder=""
            >
              {currentStep < 3 ? "Next" : "Submit"}
            </Button>
            {/* )} */}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InitialSetupSettings;
