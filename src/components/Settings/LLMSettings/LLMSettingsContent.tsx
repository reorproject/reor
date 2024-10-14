import React, { useState, useEffect } from 'react'
import Slider from '@mui/material/Slider'
import { Button } from '@material-tailwind/react'

import { LLMGenerationParameters } from 'electron/main/electron-store/storeConfig'
import DefaultLLMSelector from './DefaultLLMSelector'
import useLLMConfigs from './hooks/use-llm-configs'
import useModals from './hooks/use-modals'

import SettingsRow from '../Shared/SettingsRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LLMSettingsContentProps {}

const LLMSettingsContent: React.FC<LLMSettingsContentProps> = () => {
  const { llmConfigs, defaultLLM, setDefaultLLM, fetchAndUpdateModelConfigs } = useLLMConfigs()
  const { modals, openModal, closeModal } = useModals()

  const [textGenerationParams, setTextGenerationParams] = useState<LLMGenerationParameters>({
    temperature: 0.7,
  })
  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false)

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
    if (textGenerationParams) {
      window.electronStore.setLLMGenerationParams(textGenerationParams)
      setUserHasMadeUpdate(false)
    }
  }

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

  const modalOptions = [
    { label: 'OpenAI Setup', value: 'openai' },
    { label: 'Anthropic Setup', value: 'anthropic' },
  ]

  return (
    <div>
      <h2 className="mb-4 font-semibold text-white">LLM</h2>
      {llmConfigs.length > 0 && (
        <div className="flex w-full flex-wrap items-center justify-between gap-5 pb-2">
          <div className="flex-col">
            <p className="mt-5 text-gray-100">Default LLM</p>
          </div>{' '}
          <div className="mb-1 flex w-[140px] min-w-[128px]">
            <DefaultLLMSelector llmConfigs={llmConfigs} defaultLLM={defaultLLM} setDefaultLLM={setDefaultLLM} />
          </div>
        </div>
      )}

      <div className="h-[2px] w-full bg-neutral-700" />

      <SettingsRow
        title="Local LLM"
        buttonText="Add New Local LLM"
        description="Attach a local LLM. Reor will download the model for you."
        onClick={() => openModal('newLocalModel')}
      />
      <SettingsRow title="Setup OpenAI or Anthropic" description="Add your API key">
        <Select onValueChange={(value) => openModal(value as 'openai' | 'anthropic')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Attach Cloud LLM" />
          </SelectTrigger>
          <SelectContent>
            {modalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsRow>
      <SettingsRow
        title="Setup remote LLMs"
        description="Non-OpenAI/Anthropic LLMs"
        buttonText="Remote LLM Setup"
        onClick={() => openModal('remoteLLM')}
      />

      {/* Text Generation Settings */}
      <div className="flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-4">
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
          <p className="mt-2 text-xs text-gray-100">
            Note: Higher temperature means more randomness in generated text.
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 py-4">
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
      {userHasMadeUpdate && (
        <div className="mt-4">
          <Button
            placeholder=""
            onClick={handleSave}
            className="h-8 w-[150px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
          >
            Save
          </Button>
        </div>
      )}

      {Object.entries(modals).map(([key, { isOpen, Component }]) => (
        <Component
          key={key}
          isOpen={isOpen}
          onClose={() => {
            closeModal(key as keyof typeof modals)
            fetchAndUpdateModelConfigs()
          }}
        />
      ))}
    </div>
  )
}

export default LLMSettingsContent
