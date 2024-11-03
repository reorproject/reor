import { useState, useEffect, useCallback } from 'react'

import { LLMConfig } from 'electron/main/electron-store/storeConfig'

const useLLMConfigs = () => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([])
  const [defaultLLM, setDefaultLocalLLM] = useState<string>('')

  const fetchAndUpdateModelConfigs = useCallback(async () => {
    const fetchedLLMConfigs = await window.llm.getLLMConfigs()
    setLLMConfigs(fetchedLLMConfigs)
    const storedDefaultLLM = await window.llm.getDefaultLLMName()
    if (!storedDefaultLLM && fetchedLLMConfigs.length > 0) {
      await window.llm.setDefaultLLM(fetchedLLMConfigs[0].modelName)
      setDefaultLocalLLM(fetchedLLMConfigs[0].modelName)
    } else {
      setDefaultLocalLLM(storedDefaultLLM)
    }
  }, [])

  useEffect(() => {
    window.ipcRenderer.on('llm-configs-changed', fetchAndUpdateModelConfigs)
  }, [fetchAndUpdateModelConfigs])

  const setDefaultLLM = async (modelName: string) => {
    await window.llm.setDefaultLLM(modelName)
    setDefaultLocalLLM(modelName)
  }

  useEffect(() => {
    fetchAndUpdateModelConfigs()
  }, [fetchAndUpdateModelConfigs])

  return {
    llmConfigs,
    defaultLLM,
    setDefaultLLM,
    fetchAndUpdateModelConfigs,
  }
}

export default useLLMConfigs
