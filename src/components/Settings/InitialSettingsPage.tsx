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
  const [nextPageAllowed, setNextPageAllowed] = useState(false);
  const [userTriedToSubmit, setUserTriedToSubmit] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("directoryPicker");

  const steps = ["directoryPicker", "llmSettings", "embeddingModel"];

  // Get the current step index
  const currentStepIndex = steps.indexOf(activeTab);

  // Handle "Next" button click
  const handleNext = () => {
    console.log("current step index: ", currentStepIndex);
    if (currentStepIndex < steps.length - 1) {
      console.log("setting active tab to: ", steps[currentStepIndex + 1]);
      setActiveTab(steps[currentStepIndex + 1]);
    }
  };

  // Handle "Back" button click
  // const handleBack = () => {
  //   if (currentStepIndex > 0) {
  //     setActiveTab(steps[currentStepIndex - 1]);
  //   }
  // };

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        console.log("no close for now");
      }}
    >
      <div className=" mt-0  flex w-[600px] min-h-[300px]">
        <div className="flex flex-col ml-2 pr-1 w-[120px]  bg-gray-800 text-white border-r-[0.1px] border-gray-700 border-solid border-b-0 border-t-0 border-l-0">
          <div
            className={`flex items-center mt-2 rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 text-sm ${
              activeTab === "directoryPicker"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab("directoryPicker")}
          >
            1. Vault
          </div>
          <div
            className={`flex items-center mt-2 rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 text-sm ${
              activeTab === "llmSettings"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab("llmSettings")}
          >
            2. LLM
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 text-sm ${
              activeTab === "embeddingModel"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab("embeddingModel")}
          >
            3. Embedding Model
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 ml-2 w-full">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === "directoryPicker" && (
            <DirectoryPicker
              userHasCompleted={(allowed) => setNextPageAllowed(allowed)}
              userTriedToSubmit={userTriedToSubmit}
            />
          )}
          {activeTab === "embeddingModel" && (
            <div className="w-full">
              <EmbeddingModelManager
                handleUserHasChangedModel={(completed) =>
                  setNextPageAllowed(completed)
                }
                childrenBelowDropdown={
                  <p className=" text-gray-100 text-xs">
                    <i>
                      If you notice some lag in the editor it is likely because
                      you chose too large of a model...
                    </i>
                  </p>
                }
              >
                <h2 className="text-2xl font-semibold mb-0 text-white">
                  Embedding Model
                </h2>{" "}
                <p className="mt-5 text-gray-100">
                  If you change this, your files will be re-indexed:
                </p>
                {/* <EmbeddingModelManager.childrenBelowDropdown> */}
                {/* </EmbeddingModelManager.childrenBelowDropdown> */}
              </EmbeddingModelManager>
            </div>
          )}

          {activeTab === "llmSettings" && (
            <div className="mt-2 w-full">
              <LLMSettings />
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button
              className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2 mt-1 mr-0 mb-3"
              onClick={handleNext}
              placeholder=""
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InitialSetupSettings;

// const handleNext = () => {
//   setUserTriedToSubmit(true);
//   if (currentStep < 3 && nextPageAllowed) {
//     setCurrentStep(currentStep + 1);
//     setNextPageAllowed(false);
//   } else {
//     if (nextPageAllowed) {
//       initialSettingsAreReady();
//     }
//   }
// };

// const handleBack = () => {
//   if (currentStep > 1) {
//     setCurrentStep(currentStep - 1);
//     setNextPageAllowed(false);
//   }
// };
