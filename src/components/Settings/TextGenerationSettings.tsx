import React, { useState, useEffect, useRef } from "react";

import { Button } from "@material-tailwind/react";
import Slider from "@mui/material/Slider";
import { LLMGenerationParameters } from "electron/main/electronStore/storeConfig";

interface TextGenerationSettingsProps {}
const TextGenerationSettings: React.FC<TextGenerationSettingsProps> = () => {
  const [textGenerationParams, setTextGenerationParams] =
    useState<LLMGenerationParameters>({
      temperature: 0.7, // Default temperature value
      // maxTokens: 2048, // Default maxTokens value
      // Include other default values as necessary
    });

  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false);
  const inputRef = useRef(null);
  // const [temperature, setTemperature] = useState<number | null>();
  // const [maxTokens, setMaxTokens] = useState<number | null>();

  useEffect(() => {
    const fetchParams = async () => {
      const params = await window.electronStore.getLLMGenerationParams();
      if (params) {
        setTextGenerationParams(params);
      }
    };

    fetchParams();
  }, []);

  const handleSave = () => {
    // Execute the save function here
    if (textGenerationParams) {
      window.electronStore.setLLMGenerationParams(textGenerationParams);
      setUserHasMadeUpdate(false);
    }
  };

  const handleTokenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserHasMadeUpdate(true);
    const inputVal = e.target.value;
    let newMaxTokens;

    // Check if the input value is an empty string, set newMaxTokens to undefined.
    if (inputVal === "") {
      newMaxTokens = undefined;
    } else {
      // Parse the input value to an integer and use it if it's a valid number
      const parsedValue = parseInt(inputVal, 10);
      if (!isNaN(parsedValue)) {
        newMaxTokens = parsedValue;
      } else {
        // Optional: handle the case for invalid input that's not empty, e.g., non-numeric characters.
        // For now, we'll just return to avoid setting newMaxTokens to an invalid value.
        return;
      }
    }

    setTextGenerationParams({
      ...textGenerationParams,
      maxTokens: newMaxTokens,
    });
    // window.electronStore.setLLMGenerationParams(textGenerationParams);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-dark-gray-c-three rounded pb-7">
      <h2 className="text-2xl font-semibold mb-0 text-white">
        Text Generation
      </h2>{" "}
      <div className="justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2 mt-5">
        <p className="mt-2 text-gray-100 mb-1">Temperature:</p>
        <div className="pl-1 mt-2 ">
          <Slider
            aria-label="Temperature"
            value={textGenerationParams.temperature}
            valueLabelDisplay="on" // Changed from "auto" to "on" to always show the value label
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
            sx={{
              // Targeting the value label component
              "& .MuiSlider-thumb": {
                "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                  boxShadow: "none",
                },
                // If you need to remove the ripple effect explicitly
                "&::after": {
                  content: "none",
                },
              },
              "& .MuiSlider-valueLabel": {
                fontSize: "0.75rem", // Reduce font size
                padding: "3px 6px", // Adjust padding to make the label smaller
                // You may need to adjust lineHeight if the text is not vertically aligned
                lineHeight: "1.2em",
              },
            }}
          />
        </div>
        <p className="mt-0 text-xs text-gray-100 mb-3 ">
          Note: Higher temperature means more randomess in generated text.
        </p>
      </div>
      <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pt-3 pb-4">
        <div className="flex flex-col">
          <p className="mt-2 text-gray-100 mb-1">Max Tokens</p>
          <p className="mt-1 text-xs text-gray-100 mb-0">
            Maximum number of tokens to generate per output. Recommend to keep
            as is and let the model decide.
          </p>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            className="w-[80px] p-2 bg-dark-gray-c-eight hover:bg-dark-gray-c-ten border-none rounded-md text-gray-100"
            value={textGenerationParams?.maxTokens}
            onChange={(e) => handleTokenInput(e)}
            ref={inputRef}
            placeholder="None"
          />
        </div>
      </div>
      {userHasMadeUpdate && (
        <div className="flex">
          <Button
            // variant="contained"
            placeholder={""}
            onClick={handleSave}
            className="bg-orange-700 w-[150px] border-none h-8 hover:bg-orange-900 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mb-0 mr-4 mt-2"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default TextGenerationSettings;
