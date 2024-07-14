import React from 'react'
import type { FC } from 'react'

interface Props {
  promptText: string
  onClick?: () => void
}

const PromptSuggestion: FC<Props> = ({ promptText, onClick }: Props) => (
  <button
    className={`
            mt-2 cursor-pointer rounded border border-solid border-white/50
             bg-neutral-800 p-5
            text-base
            text-white shadow hover:bg-neutral-300 hover:text-black`}
    onClick={onClick}
    type="button"
  >
    {promptText}
  </button>
)

export default PromptSuggestion
