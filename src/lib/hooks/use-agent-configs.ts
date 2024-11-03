import { useState, useEffect } from 'react'
import { AgentConfig } from '../llm/types'
import exampleAgents from '@/components/Chat/ChatConfigComponents/exampleAgents'

interface UseAgentConfigReturn {
  agentConfig: AgentConfig | undefined
  setAgentConfig: (config: AgentConfig | ((prev: AgentConfig | undefined) => AgentConfig)) => void
}

function useAgentConfig(): UseAgentConfigReturn {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>()

  useEffect(() => {
    const fetchAgentConfigs = async () => {
      const agentConfigs = await window.electronStore.getAgentConfigs()
      if (agentConfigs && agentConfigs.length > 0) {
        setAgentConfig(agentConfigs[0])
      } else {
        setAgentConfig(exampleAgents[0])
      }
    }
    fetchAgentConfigs()
  }, [])

  return {
    agentConfig,
    setAgentConfig,
  }
}

export default useAgentConfig
