import React, { useState, useEffect } from "react";

import { Button } from "@material-tailwind/react";
import { LLMConfig } from "electron/main/Store/storeConfig";
import posthog from "posthog-js";
import Modal from "../Generic/Modal";

import CustomSelect from "../Generic/Select";

import DefaultLLMSelector from "./DefaultLLMSelector";
import CloudLLMSetupModal from "./ExtraModals/CloudLLMSetup";
import NewOllamaModelModal from "./ExtraModals/NewOllamaModel";
import RemoteLLMSetupModal from "./ExtraModals/RemoteLLMSetup";

interface LLMSettingsProps {
  userHasCompleted?: (completed: boolean) => void;
  userTriedToSubmit?: boolean;
  isInitialSetup?: boolean;
}

const LLMSettings: React.FC<LLMSettingsProps> = ({
  userHasCompleted,
  userTriedToSubmit,
  isInitialSetup,
}) => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([]);
  const [userMadeChanges, setUserMadeChanges] = useState<boolean>(false);
  const [isNewLocalModelModalOpen, setIsNewLocalModelModalOpen] =
    useState<boolean>(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);

  const [isRemoteLLMModalOpen, setIsRemoteLLMModalOpen] =
    useState<boolean>(false);

  const [isCloudLLMModalOpen, setIsCloudLLMModalOpen] =
    useState<boolean>(false);
  const [selectedCloudLLMModal, setSelectedCloudLLMModal] =
    useState<string>("");

  const modalOptions = [
    {
      label: "OpenAI Setup",
      value: "openai",
    },
    {
      label: "Anthropic Setup",
      value: "anthropic",
    },
  ];

  const handleSetUpSelection = () => {
    setIsSetupModalOpen(true);
  };

  const handleModalSelection = (selectedValue: string) => {
    setSelectedCloudLLMModal(selectedValue);
    setIsCloudLLMModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCloudLLMModalOpen(false);
    setSelectedCloudLLMModal("");
  };

  const [defaultModel, setDefaultModel] = useState<string>("");
  const [currentError, setCurrentError] = useState<string>("");

  const fetchAndUpdateModelConfigs = async () => {
    try {
      const fetchedLLMConfigs = await window.llm.getLLMConfigs();
      setLLMConfigs(fetchedLLMConfigs);
      if (fetchedLLMConfigs !== llmConfigs && llmConfigs.length > 0) {
        setUserMadeChanges(true);
      }
      const defaultModelName = await window.llm.getDefaultLLMName();

      setDefaultModel(defaultModelName);
    } catch (error) {
      console.error("Failed to fetch model configurations:", error);
    }
  };

  useEffect(() => {
    fetchAndUpdateModelConfigs();
  }, [isNewLocalModelModalOpen, isRemoteLLMModalOpen, isCloudLLMModalOpen]);

  useEffect(() => {
    // this condition may in fact be less necessary: no need for the user to use chatbot...
    if (defaultModel) {
      if (setCurrentError) {
        setCurrentError("");
      }
      if (userHasCompleted) {
        userHasCompleted(true);
      }
    } else {
      if (setCurrentError) {
        setCurrentError("No model selected");
      }
      if (userHasCompleted) {
        userHasCompleted(false);
      }
    }
  }, [defaultModel]);

  const handleDefaultModelChange = (selectedModel: string) => {
    setDefaultModel(selectedModel);
    setUserMadeChanges(true);
    window.llm.setDefaultLLM(selectedModel);
    posthog.capture("change_default_llm", {
      defaultLLM: selectedModel,
    });
  };

  // const handleDeleteModel = async (modelToDelete: string) => {
  //   await window.llm.removeLLM(modelToDelete);
  //   fetchAndUpdateModelConfigs();
  // };

  const modelOptions = llmConfigs.map((config) => {
    return {
      label: config.modelName,
      value: config.modelName,
    };
  });

  const handleModelChange = (model: string) => {
    setUserMadeChanges(true);
    userHasCompleted?.(!!model);
  };

  const handleModelError = (error: string) => {
    setCurrentError(error);
    userHasCompleted?.(false);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-dark-gray-c-three rounded">
      {isInitialSetup ? (
        <div className="flex justify-between items-center border-b-2 border-solid border-neutral-700 border-0 py-1">
          <p className="mb-2 pb-3 text-gray-100">LLM</p>{" "}
          <Button
            className="flex justify-between items-center w-[80px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
            onClick={() => setIsSetupModalOpen(true)}
            placeholder=""
          >
            Setup
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-4 text-white">LLM</h2>
          {llmConfigs.length > 0 && (
            <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
              <h4 className="text-gray-200 text-center font-normal">
                Default LLM
              </h4>
              <div className="mb-1">
                <DefaultLLMSelector
                  onModelChange={handleModelChange}
                  onModelError={handleModelError}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
            <h4 className="text-gray-200 text-center font-normal">
              Local LLM Settings
            </h4>
            <div className="flex">
              <Button
                className="flex justify-between items-center min-w-[192px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
                onClick={() => setIsNewLocalModelModalOpen(true)}
                placeholder={""}
              >
                Add New Local LLM
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
            <h4 className="text-gray-200 text-center font-normal">
              Setup remote LLMs
            </h4>
            <div className="flex">
              <Button
                className="flex justify-between items-center min-w-[192px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
                onClick={() => setIsRemoteLLMModalOpen(true)}
                placeholder=""
              >
                Remote LLM Setup
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        name="newNote"
      >
        <div>
          <h2 className="font-semibold mb-4 text-white">LLM</h2>
          {llmConfigs.length > 0 && (
            <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
              <h4 className="text-gray-200 text-center font-normal">
                Default LLM
              </h4>
              <div className="mb-1">
                <DefaultLLMSelector
                  onModelChange={handleModelChange}
                  onModelError={handleModelError}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
            <h4 className="text-gray-200 text-center font-normal">
              Local LLM Settings
            </h4>
            <div className="flex">
              <Button
                className="flex justify-between items-center min-w-[192px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
                onClick={() => setIsNewLocalModelModalOpen(true)}
                placeholder={""}
              >
                Add New Local LLM
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
            <h4 className="text-gray-200 text-center font-normal">
              Setup remote LLMs
            </h4>
            <div className="flex">
              <Button
                className="flex justify-between items-center min-w-[192px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
                onClick={() => setIsRemoteLLMModalOpen(true)}
                placeholder=""
              >
                Remote LLM Setup
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <NewOllamaModelModal
        isOpen={isNewLocalModelModalOpen}
        onClose={() => {
          setIsNewLocalModelModalOpen(false);
        }}
      />
      <RemoteLLMSetupModal
        isOpen={isRemoteLLMModalOpen}
        onClose={() => {
          setIsRemoteLLMModalOpen(false);
        }}
      />
      {isCloudLLMModalOpen && selectedCloudLLMModal === "openai" && (
        <CloudLLMSetupModal
          isOpen={isCloudLLMModalOpen}
          onClose={handleModalClose}
          LLMType="openai"
        />
      )}
      {isCloudLLMModalOpen && selectedCloudLLMModal === "anthropic" && (
        <CloudLLMSetupModal
          isOpen={isCloudLLMModalOpen}
          onClose={handleModalClose}
          LLMType="anthropic"
        />
      )}
      {userMadeChanges && (
        <p className="text-xs text-slate-100 mt-1">
          Note: You&apos;ll need to refresh the chat window to apply these
          changes.
        </p>
      )}
      {userTriedToSubmit && !defaultModel && (
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
      )}
    </div>
  );
};

export default LLMSettings;
