import React, { useState, useEffect, ReactNode } from "react";
import Slider from "@mui/material/Slider";
import { LLMGenerationParameters } from "electron/main/Store/storeConfig";
import { Button } from "@material-tailwind/react";

interface TextGenerationSettingsProps {
  children?: ReactNode; // Define children prop
}
const TextGenerationSettings: React.FC<TextGenerationSettingsProps> = ({
  children,
}) => {
  const [textGenerationParams, setTextGenerationParams] =
    useState<LLMGenerationParameters>({
      temperature: 0.7, // Default temperature value
      maxTokens: 2048, // Default maxTokens value
      // Include other default values as necessary
    });

  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false);
  // const [temperature, setTemperature] = useState<number | null>();
  // const [maxTokens, setMaxTokens] = useState<number | null>();

  useEffect(() => {
    const params = window.electronStore.getLLMGenerationParams();
    if (params) {
      setTextGenerationParams(params);
    }
  }, []);

  const handleSave = () => {
    // Execute the save function here
    if (textGenerationParams) {
      window.electronStore.setLLMGenerationParams(textGenerationParams);
      setUserHasMadeUpdate(false);
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded pb-7">
      {children}
      <h2 className="text-2xl font-semibold mb-0 text-white">
        Text Generation
      </h2>{" "}
      <p className="mt-2 text-sm text-gray-100 mb-1">Temperature:</p>
      <Slider
        aria-label="Temperature"
        value={textGenerationParams.temperature}
        valueLabelDisplay="auto"
        step={0.1}
        marks
        min={0}
        max={2}
        onChange={(event, val) => {
          setUserHasMadeUpdate(true);
          const newTemperature = Array.isArray(val) ? val[0] : val;
          setTextGenerationParams({
            ...textGenerationParams,
            temperature: newTemperature,
          });
        }}
      />
      <p className="mt-0 text-xs text-gray-100 mb-3">
        Higher temperature means more randomess in generated text.
      </p>
      <p className="mt-2 text-sm text-gray-100 mb-1">Max Tokens:</p>
      <input
        type="text"
        className="block w-full px-3 py-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
        value={textGenerationParams?.maxTokens || 2048}
        onChange={(e) => {
          setUserHasMadeUpdate(true);
          const newMaxTokens = parseInt(e.target.value);
          setTextGenerationParams({
            ...textGenerationParams,
            maxTokens: newMaxTokens,
          });
        }}
        // onKeyDown={handleKeyPress}
        placeholder="Value between 0 and 2048"
      />
      <p className="mt-1 text-xs text-gray-100 mb-3">
        Maximum number of tokens to generate.
      </p>
      {userHasMadeUpdate && (
        <div className="flex">
          <Button
            // variant="contained"
            placeholder={""}
            onClick={handleSave}
            className="bg-slate-700 w-[150px] border-none h-8 hover:bg-slate-900 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mb-0 mr-4 mt-2"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default TextGenerationSettings;
