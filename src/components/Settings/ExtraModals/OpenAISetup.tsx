import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../../Generic/Modal";
import { OpenAILLMConfig } from "electron/main/Store/storeConfig";

interface OpenAISetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpenAISetupModal: React.FC<OpenAISetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [openAIKey, setOpenAIKey] = useState("");

  const handleSave = () => {
    if (openAIKey) {
      for (const modelName in openAIDefaultModels) {
        window.electronStore.addOrUpdateLLM(modelName, {
          ...openAIDefaultModels[modelName],
          apiKey: openAIKey,
        });
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
    <Modal isOpen={isOpen} onClose={handleSave}>
      <div className="w-[300px] ml-3 mr-2 mb-2">
        <h3 className="font-semibold mb-0 text-white">OpenAI Setup</h3>
        <p className="text-gray-100 mb-2 mt-2 text-sm">
          Enter your OpenAI API key below:
        </p>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="OpenAI API Key"
        />
        <p className="mt-2 text-gray-100 text-xs">
          <i>
            You&apos;ll then be able to choose an OpenAI model in the model
            dropdown...
          </i>
        </p>

        <Button
          className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mt-1 w-[80px]"
          onClick={handleSave}
          placeholder=""
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};

const openAIDefaultModels: { [modelName: string]: OpenAILLMConfig } = {
  "gpt-3.5-turbo-0125": {
    contextLength: 16385,
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
  "gpt-3.5-turbo-1106": {
    contextLength: 16385,
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
  "gpt-4-0613": {
    contextLength: 8192,
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
  "gpt-4-0125-preview": {
    contextLength: 128000,
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
  "gpt-4-1106-preview": {
    contextLength: 128000,
    engine: "openai",
    type: "openai",
    apiKey: "",
    apiURL: "",
  },
};

export default OpenAISetupModal;
