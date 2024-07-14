import React from 'react'

import LLMSettingsContent from './LLMSettingsContent'

const NormalLLMSettings: React.FC = () => (
  <div className="flex size-full flex-col justify-between rounded bg-dark-gray-c-three">
    <LLMSettingsContent isInitialSetup={false} />
  </div>
)

export default NormalLLMSettings
