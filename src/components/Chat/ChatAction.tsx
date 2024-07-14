import React from 'react'
import type { FC } from 'react'

interface Props {
  actionText: string
  onClick?: () => void
}

export const ChatAction: FC<Props> = ({ actionText, onClick }: Props) => (
  <button
    className={`
      mt-2 cursor-pointer rounded border border-solid border-white
      border-opacity-50 bg-neutral-800 p-5
      text-base
      text-white shadow hover:bg-neutral-300 hover:text-black`}
    onClick={onClick}
  >
    {actionText}
  </button>
)
