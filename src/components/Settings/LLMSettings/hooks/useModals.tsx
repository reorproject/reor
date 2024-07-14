import React, { useState } from 'react';

import CloudLLMSetupModal, {
  CloudLLMSetupModalProps,
} from '../modals/CloudLLMSetup';
import NewOllamaModelModal from '../modals/NewOllamaModel';
import RemoteLLMSetupModal from '../modals/RemoteLLMSetup';

const useModals = () => {
  const [modals, setModals] = useState({
    newLocalModel: { isOpen: false, Component: NewOllamaModelModal },
    remoteLLM: { isOpen: false, Component: RemoteLLMSetupModal },
    openai: {
      isOpen: false,
      Component: (props: Omit<CloudLLMSetupModalProps, 'LLMType'>) => (
        <CloudLLMSetupModal {...props} LLMType='openai' />
      ),
    },
    anthropic: {
      isOpen: false,
      Component: (props: Omit<CloudLLMSetupModalProps, 'LLMType'>) => (
        <CloudLLMSetupModal {...props} LLMType='anthropic' />
      ),
    },
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], isOpen: true },
    }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], isOpen: false },
    }));
  };

  return { modals, openModal, closeModal };
};

export default useModals;
