import React from 'react';

import InitialSetupLLMSettings from './InitialSetupLLMSettings';
import NormalLLMSettings from './NormalLLMSettings';

interface LLMSettingsProps {
  userHasCompleted?: (completed: boolean) => void;
  userTriedToSubmit?: boolean;
  isInitialSetup?: boolean;
}

const LLMSettings: React.FC<LLMSettingsProps> = ({
  userHasCompleted,
  userTriedToSubmit,
  isInitialSetup,
}) =>
  isInitialSetup ? (
    <InitialSetupLLMSettings
      userHasCompleted={userHasCompleted}
      userTriedToSubmit={userTriedToSubmit}
    />
  ) : (
    <NormalLLMSettings />
  );

export default LLMSettings;
