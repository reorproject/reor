import React, { useState, useEffect } from "react";
import { LLMModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";
import { Button } from "@material-tailwind/react";
import LocalModelModal from "./NewLocalModel";
import OpenAISetupModal from "./OpenAISetup";
import ContextLengthModal from "./ContextLengthSettings";
import RemoteLLMSetupModal from "./RemoteLLMSetup";

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
  const [modelConfigs, setModelConfigs] = useState<
    Record<string, LLMModelConfig>
  >({});
  const [isNewLocalModelModalOpen, setIsNewLocalModelModalOpen] =
    useState<boolean>(false);

  const [isRemoteLLMModalOpen, setIsRemoteLLMModalOpen] =
    useState<boolean>(false);

  const [isOpenAIModelModalOpen, setIsOpenAIModelModalOpen] =
    useState<boolean>(false);

  const [isConextLengthModalOpen, setIsContextLengthModalOpen] =
    useState<boolean>(false);

  const [defaultModel, setDefaultModel] = useState<string>("");
  const [currentError, setCurrentError] = useState<string>("");

  const fetchModelConfigs = async () => {
    try {
      const configs = await window.electronStore.getLLMConfigs();
      setModelConfigs(configs);
      const defaultModelName = await window.electronStore.getDefaultLLM();
      setDefaultModel(defaultModelName);
    } catch (error) {
      console.error("Failed to fetch model configurations:", error);
    }
  };

  useEffect(() => {
    fetchModelConfigs();
  }, [
    isConextLengthModalOpen,
    isNewLocalModelModalOpen,
    isRemoteLLMModalOpen,
    isOpenAIModelModalOpen,
  ]);

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
    window.electronStore.setDefaultLLM(selectedModel);
  };

  const modelOptions = Object.keys(modelConfigs).map((key) => ({
    label: key, // Assuming displayName exists in AIModelConfig
    value: key,
  }));

  return (
    <div className="w-full  bg-gray-800 rounded">
      {isInitialSetup ? (
        <div>
          <h3 className="font-semibold mb-1 text-gray-100">LLM</h3>

          <div className="flex">
            <Button
              className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-1 mr-2"
              onClick={() => setIsNewLocalModelModalOpen(true)}
              placeholder={""}
            >
              Attach Local LLM
            </Button>
            <Button
              className="bg-slate-700  border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-1 mb-3 mr-2"
              onClick={() => setIsRemoteLLMModalOpen(true)}
              placeholder=""
            >
              Attach remote LLM
            </Button>
            <Button
              className="bg-slate-700  border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-1 mb-3 mr-2"
              onClick={() => setIsOpenAIModelModalOpen(true)}
              placeholder=""
            >
              Connect to OpenAI
            </Button>
          </div>
          {Object.keys(modelConfigs).length > 0 && (
            <div>
              <h4 className="text-gray-100 mb-1">Default LLM:</h4>
              <div className="w-full mb-1">
                <CustomSelect
                  options={modelOptions}
                  value={defaultModel}
                  onChange={handleDefaultModelChange}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-4 text-white">LLM</h2>
          {Object.keys(modelConfigs).length > 0 && (
            <div>
              <h4 className="text-gray-100 mb-1">Default LLM:</h4>
              <div className="w-full mb-1">
                <CustomSelect
                  options={modelOptions}
                  value={defaultModel}
                  onChange={handleDefaultModelChange}
                />
              </div>
            </div>
          )}
          <h4 className="text-gray-100 mb-1">Local LLM Settings:</h4>
          <div className="flex">
            <Button
              className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-1 mr-4"
              onClick={() => setIsNewLocalModelModalOpen(true)}
              placeholder={""}
            >
              Add New Local LLM
            </Button>
            <Button
              className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-1"
              onClick={() => setIsContextLengthModalOpen(true)}
              placeholder={""}
            >
              Context Length Settings
            </Button>
          </div>

          <h4 className="text-gray-100 mb-0">Setup remote LLMs:</h4>
          <div className="flex">
            <Button
              className="bg-slate-700  border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-2 mb-3 mr-4"
              onClick={() => setIsRemoteLLMModalOpen(true)}
              placeholder=""
            >
              Remote LLM Setup
            </Button>
            <Button
              className="bg-slate-700  border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-2 mb-3 mr-4"
              onClick={() => setIsOpenAIModelModalOpen(true)}
              placeholder=""
            >
              OpenAI Setup
            </Button>
          </div>
        </div>
      )}

      <LocalModelModal
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
      <ContextLengthModal
        isOpen={isConextLengthModalOpen}
        onClose={() => {
          setIsContextLengthModalOpen(false);
        }}
        modelConfigs={modelConfigs}
      />
      <OpenAISetupModal
        isOpen={isOpenAIModelModalOpen}
        onClose={() => {
          setIsOpenAIModelModalOpen(false);
        }}
      />
      {userTriedToSubmit && !defaultModel && (
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
      )}
    </div>
  );
};

export default LLMSettings;
