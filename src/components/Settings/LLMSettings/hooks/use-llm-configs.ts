import { useState, useEffect } from 'react'

import { LLMConfig } from 'electron/main/electron-store/storeConfig'

const useLLMConfigs = () => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([])
  const [defaultLLM, setDefaultLLM] = useState<string>('')

  const fetchAndUpdateModelConfigs = async () => {
    const fetchedLLMConfigs = await window.llm.getLLMConfigs()
    setLLMConfigs(fetchedLLMConfigs)
    const storedDefaultLLM = await window.llm.getDefaultLLMName()
    if (!storedDefaultLLM && fetchedLLMConfigs.length > 0) {
      await window.llm.setDefaultLLM(fetchedLLMConfigs[0].modelName)
      setDefaultLLM(fetchedLLMConfigs[0].modelName)
    } else {
      setDefaultLLM(storedDefaultLLM)
    }
  }

  useEffect(() => {
    fetchAndUpdateModelConfigs()
  }, [])

  return {
    llmConfigs,
    defaultLLM,
    setLLMConfigs,
    setDefaultLLM,
    fetchAndUpdateModelConfigs,
  }
}

export default useLLMConfigs
