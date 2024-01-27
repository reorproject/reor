import React, { useState, useEffect } from "react";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";
import { Button } from "@material-tailwind/react";
import LocalModelModal from "./NewLocalModel";
import RemoteLLMModal from "./RemoteLLMSetup";

interface LLMSettingsProps {
  userHasCompleted?: (completed: boolean) => void;
  // setCurrentError?: (error: string) => void;
  userTriedToSubmit?: boolean;
}

const LLMSettings: React.FC<LLMSettingsProps> = ({
  userHasCompleted,
  // setCurrentError,
  userTriedToSubmit,
}) => {
  const [modelConfigs, setModelConfigs] = useState<
    Record<string, AIModelConfig>
  >({});
  const [isNewLocalModelModalOpen, setIsNewLocalModelModalOpen] =
    useState<boolean>(false);

  const [isRemoteLLMModalOpen, setIsRemoteLLMModalOpen] =
    useState<boolean>(false);

  const [defaultModel, setDefaultModel] = useState<string>("");
  const [currentError, setCurrentError] = useState<string>("");

  const fetchModelConfigs = async () => {
    try {
      const configs = await window.electronStore.getAIModelConfigs();
      setModelConfigs(configs);
      const defaultModelName = await window.electronStore.getDefaultAIModel();
      setDefaultModel(defaultModelName);
    } catch (error) {
      console.error("Failed to fetch model configurations:", error);
    }
  };

  useEffect(() => {
    fetchModelConfigs();
  }, []);

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
    window.electronStore.setDefaultAIModel(selectedModel);
  };

  const modelNames = Object.keys(modelConfigs);

  return (
    <div className="w-full  bg-gray-800 rounded">
      <h2 className="font-semibold mb-4 text-white">LLM</h2>
      <h4 className="text-gray-100 mb-1">Default LLM:</h4>
      <div className="w-full mb-1">
        <CustomSelect
          options={modelNames}
          value={defaultModel}
          onChange={handleDefaultModelChange}
          addButton={{
            label: "Add a New Local Model",
            onClick: () => setIsNewLocalModelModalOpen(true),
          }}
        />
      </div>
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
          onClick={() => setIsNewLocalModelModalOpen(true)}
          placeholder={""}
        >
          Context Length Settings
        </Button>
      </div>

      <h4 className="text-gray-100 mb-0">Setup a new remote (OpenAI) LLM:</h4>
      <div className="flex">
        <Button
          className="bg-slate-700  border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-2 mb-3 mr-4"
          onClick={() => setIsNewLocalModelModalOpen(true)}
          placeholder=""
        >
          Remote LLM Setup
        </Button>
        <div className="border-none h-8 w-full text-center pt-0 pb-0 pr-2 pl-2 mt-1"></div>
      </div>
      <LocalModelModal
        isOpen={isNewLocalModelModalOpen}
        onClose={() => {
          setIsNewLocalModelModalOpen(false);
          fetchModelConfigs();
        }}
      />
      <RemoteLLMModal
        isOpen={isRemoteLLMModalOpen}
        onClose={() => setIsRemoteLLMModalOpen(false)}
      />
      {userTriedToSubmit && !defaultModel && (
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
      )}
    </div>
  );
};

export default LLMSettings;
