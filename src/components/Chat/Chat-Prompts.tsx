import React from 'react'
import type { FC } from 'react'

interface Props {
  promptText: string
  onClick?: () => void
}

const PromptSuggestion: FC<Props> = ({ promptText, onClick }: Props) => (
  <button
    className={`max-w-[200px] h-[100px]
            mt-2 cursor-pointer rounded border border-solid border-white/50
             bg-transparent p-5 opacity-40 text-xs rounded-lg mx-1
            text-base
            text-white shadow hover:opacity-70`}
    onClick={onClick}
    type="button"
  >
    {promptText}
  </button>
)

export default PromptSuggestion
