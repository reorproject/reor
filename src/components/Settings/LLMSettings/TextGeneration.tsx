import React from 'react'
import Slider from '@mui/material/Slider'
import { LLMGenerationParameters } from 'electron/main/electron-store/storeConfig'

interface TextGenerationSettingsProps {
  textGenerationParams: LLMGenerationParameters
  setTextGenerationParams: React.Dispatch<React.SetStateAction<LLMGenerationParameters>>
  setUserHasMadeUpdate: React.Dispatch<React.SetStateAction<boolean>>
}

const TextGenerationSettings: React.FC<TextGenerationSettingsProps> = ({
  textGenerationParams,
  setTextGenerationParams,
  setUserHasMadeUpdate,
}) => {
  const handleTokenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserHasMadeUpdate(true)
    const inputVal = e.target.value
    let newMaxTokens

    if (inputVal === '') {
      newMaxTokens = undefined
    } else {
      const parsedValue = parseInt(inputVal, 10)
      if (!Number.isNaN(parsedValue)) {
        newMaxTokens = parsedValue
      } else {
        return
      }
    }

    setTextGenerationParams({
      ...textGenerationParams,
      maxTokens: newMaxTokens,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex-col">
        <p className="mb-2 text-gray-100">Temperature:</p>
        <Slider
          aria-label="Temperature"
          value={textGenerationParams.temperature}
          valueLabelDisplay="on"
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
            '& .MuiSlider-thumb': {
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: 'none',
              },
              '&::after': {
                content: 'none',
              },
            },
            '& .MuiSlider-valueLabel': {
              fontSize: '0.75rem',
              padding: '3px 6px',
              lineHeight: '1.2em',
            },
          }}
        />
        <p className="mt-2 text-xs text-gray-100">Note: Higher temperature means more randomness in generated text.</p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-col">
          <p className="mb-1 text-gray-100">Max Tokens</p>
          <p className="text-xs text-gray-100">
            Maximum number of tokens to generate per output. Recommend to keep as is and let the model decide.
          </p>
        </div>
        <input
          type="text"
          className="w-[80px] rounded-md border-none bg-dark-gray-c-eight p-2 text-gray-100 hover:bg-dark-gray-c-ten"
          value={textGenerationParams?.maxTokens}
          onChange={handleTokenInput}
          placeholder="None"
        />
      </div>
    </div>
  )
}

export default TextGenerationSettings
