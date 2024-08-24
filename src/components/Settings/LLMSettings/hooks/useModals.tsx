import React, { useState } from 'react'

import DefaultLLMAPISetupModal, { CloudLLMSetupModalProps } from '../modals/DefaultLLMAPISetupModal'
import NewOllamaModelModal from '../modals/NewOllamaModel'
import RemoteLLMSetupModal from '../modals/CustomLLMAPISetup'

const useModals = () => {
  const [modals, setModals] = useState({
    newLocalModel: { isOpen: false, Component: NewOllamaModelModal },
    remoteLLM: { isOpen: false, Component: RemoteLLMSetupModal },
    openai: {
      isOpen: false,
      Component: ({ isOpen, onClose }: Omit<CloudLLMSetupModalProps, 'LLMType'>) => (
        <DefaultLLMAPISetupModal isOpen={isOpen} onClose={onClose} apiInterface="openai" />
      ),
    },
    anthropic: {
      isOpen: false,
      Component: ({ isOpen, onClose }: Omit<CloudLLMSetupModalProps, 'LLMType'>) => (
        <DefaultLLMAPISetupModal isOpen={isOpen} onClose={onClose} apiInterface="anthropic" />
      ),
    },
  })

  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], isOpen: true },
    }))
  }

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: { ...prev[modalName], isOpen: false },
    }))
  }

  return { modals, openModal, closeModal }
}

export default useModals
