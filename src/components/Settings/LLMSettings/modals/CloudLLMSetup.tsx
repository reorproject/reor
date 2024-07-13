import React, { useState } from "react";

import { Button } from "@material-tailwind/react";
import {
  OpenAILLMConfig,
  AnthropicLLMConfig,
} from "electron/main/electron-store/storeConfig";
import posthog from "posthog-js";

import ReorModal from "../../../Common/Modal";

export interface CloudLLMSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  LLMType: "openai" | "anthropic";
  refreshLLMs?: () => void;
}

const CloudLLMSetupModal: React.FC<CloudLLMSetupModalProps> = ({
  isOpen,
  onClose,
  LLMType,
  refreshLLMs,
}) => {
  const [openKey, setOpenKey] = useState("");

  const defaultModels =
    LLMType === "openai" ? openAIDefaultModels : AnthropicDefaultModels;
  const LLMDisplayName = LLMType === "openai" ? "OpenAI" : "Anthropic";

  const handleSave = async () => {
    console.log("openKey:", openKey);
    if (openKey) {
      for (const modelConfig of defaultModels) {
        console.log("modelConfig:", modelConfig);
        posthog.capture("save_cloud_llm", {
          modelName: modelConfig.modelName,
          llmType: LLMType,
          contextLength: modelConfig.contextLength,
        });
        modelConfig.apiKey = openKey;
        console.log("saving modelConfig:", modelConfig);
        await window.llm.addOrUpdateLLM(modelConfig);
      }
      if (defaultModels.length > 0) {
        window.llm.setDefaultLLM(defaultModels[0].modelName);
      }
      if (refreshLLMs) {
        refreshLLMs();
      }
    }

    onClose();
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <ReorModal isOpen={isOpen} onClose={handleSave}>
      <div className="w-[300px] ml-3 mr-2 mb-2">
        <h3 className="font-semibold mb-0 text-white">
          {LLMDisplayName} Setup
        </h3>
        <p className="text-gray-100 mb-2 mt-2 text-sm">
          Enter your {LLMDisplayName} API key below:
        </p>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={openKey}
          onChange={(e) => { setOpenKey(e.target.value); }}
          onKeyDown={handleKeyPress}
          placeholder={`${LLMDisplayName} API Key`}
        />
        <p className="mt-2 text-gray-100 text-xs">
          <i>
            You&apos;ll then be able to choose an {LLMDisplayName} model in the
            model dropdown...
          </i>
        </p>

        <Button
          className="bg-blue-500  border-none h-8 hover:bg-blue-600 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mt-1 w-[80px]"
          onClick={handleSave}
          placeholder=""
        >
          Save
        </Button>
      </div>
    </ReorModal>
  );
};

const openAIDefaultModels: OpenAILLMConfig[] = [
  {
    contextLength: 128000,
    modelName: "gpt-4o",
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
  {
    contextLength: 16385,
    modelName: "gpt-3.5-turbo",
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
  {
    contextLength: 128000,
    modelName: "gpt-4-turbo",
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
];

const AnthropicDefaultModels: AnthropicLLMConfig[] = [
  {
    contextLength: 180000,
    modelName: "claude-3-5-sonnet-20240620",
    engine: "anthropic",
    type: "anthropic",
    apiKey: "",
    apiURL: "",
  },
];

export default CloudLLMSetupModal;
