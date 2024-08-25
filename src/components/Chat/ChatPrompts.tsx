import React from 'react'
import type { FC } from 'react'

interface Props {
  promptText: string
  onClick?: () => void
}

const PromptSuggestion: FC<Props> = ({ promptText, onClick }: Props) => (
  <button
    className={`mx-1 mt-2
            h-[100px] max-w-[200px] cursor-pointer rounded-lg border
             border-solid border-white/50 bg-transparent p-5 text-xs
            text-white
            opacity-40 shadow hover:opacity-70`}
    onClick={onClick}
    type="button"
  >
    {promptText}
  </button>
)

export default PromptSuggestion
