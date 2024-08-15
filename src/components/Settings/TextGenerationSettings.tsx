import React, { useState, useEffect, useRef } from 'react'

import { Button } from '@material-tailwind/react'
import Slider from '@mui/material/Slider'
import { LLMGenerationParameters } from 'electron/main/electron-store/storeConfig'

interface TextGenerationSettingsProps {}
const TextGenerationSettings: React.FC<TextGenerationSettingsProps> = () => {
  const [textGenerationParams, setTextGenerationParams] = useState<LLMGenerationParameters>({
    temperature: 0.7, // Default temperature value
    // maxTokens: 2048, // Default maxTokens value
    // Include other default values as necessary
  })

  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false)
  const inputRef = useRef(null)
  // const [temperature, setTemperature] = useState<number | null>();
  // const [maxTokens, setMaxTokens] = useState<number | null>();

  useEffect(() => {
    const fetchParams = async () => {
      const params = await window.electronStore.getLLMGenerationParams()
      if (params) {
        setTextGenerationParams(params)
      }
    }

    fetchParams()
  }, [])

  const handleSave = () => {
    // Execute the save function here
    if (textGenerationParams) {
      window.electronStore.setLLMGenerationParams(textGenerationParams)
      setUserHasMadeUpdate(false)
    }
  }

  const handleTokenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserHasMadeUpdate(true)
    const inputVal = e.target.value
    let newMaxTokens

    // Check if the input value is an empty string, set newMaxTokens to undefined.
    if (inputVal === '') {
      newMaxTokens = undefined
    } else {
      // Parse the input value to an integer and use it if it's a valid number
      const parsedValue = parseInt(inputVal, 10)
      if (!Number.isNaN(parsedValue)) {
        newMaxTokens = parsedValue
      } else {
        // Optional: handle the case for invalid input that's not empty, e.g., non-numeric characters.
        // For now, we'll just return to avoid setting newMaxTokens to an invalid value.
        return
      }
    }

    setTextGenerationParams({
      ...textGenerationParams,
      maxTokens: newMaxTokens,
    })
    // window.electronStore.setLLMGenerationParams(textGenerationParams);
  }

  return (
    <div className="flex size-full flex-col rounded bg-dark-gray-c-three pb-7">
      <h2 className="mb-0 text-2xl font-semibold text-white">Text Generation</h2>{' '}
      <div className="mt-5 w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2">
        <p className="mb-1 mt-2 text-gray-100">Temperature:</p>
        <div className="mt-2 pl-1 ">
          <Slider
            aria-label="Temperature"
            value={textGenerationParams.temperature}
            valueLabelDisplay="on" // Changed from "auto" to "on" to always show the value label
            step={0.1}
            marks
            min={0}
            max={2}
            onChange={(event, val) => {
              setUserHasMadeUpdate(true)
              const newTemperature = Array.isArray(val) ? val[0] : val
              setTextGenerationParams({
                ...textGenerationParams,
                temperature: newTemperature,
              })
            }}
            sx={{
              // Targeting the value label component
              '& .MuiSlider-thumb': {
                '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                  boxShadow: 'none',
                },
                // If you need to remove the ripple effect explicitly
                '&::after': {
                  content: 'none',
                },
              },
              '& .MuiSlider-valueLabel': {
                fontSize: '0.75rem', // Reduce font size
                padding: '3px 6px', // Adjust padding to make the label smaller
                // You may need to adjust lineHeight if the text is not vertically aligned
                lineHeight: '1.2em',
              },
            }}
          />
        </div>
        <p className="mb-3 mt-0 text-xs text-gray-100 ">
          Note: Higher temperature means more randomess in generated text.
        </p>
      </div>
      <div className="flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-4 pt-3">
        <div className="flex flex-col">
          <p className="mb-1 mt-2 text-gray-100">Max Tokens</p>
          <p className="mb-0 mt-1 text-xs text-gray-100">
            Maximum number of tokens to generate per output. Recommend to keep as is and let the model decide.
          </p>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            className="w-[80px] rounded-md border-none bg-dark-gray-c-eight p-2 text-gray-100 hover:bg-dark-gray-c-ten"
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
            placeholder=""
            onClick={handleSave}
            className="mb-0 mr-4 mt-2 h-8 w-[150px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
          >
            Save
          </Button>
        </div>
      )}
    </div>
  )
}

export default TextGenerationSettings
