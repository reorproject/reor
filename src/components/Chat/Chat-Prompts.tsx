import React from "react";
import type { FC } from "react";

interface Props {
  promptText: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ChatPrompt: FC<Props> = ({ promptText, onClick, disabled } : Props) => {
    return (
      <button
        className={`
            rounded bg-gray-200 p-5 shadow dark:bg-gray-700 text-white text-base
            hover:bg-gray-300 hover:text-black mt-2
            border-solid border border-white border-opacity-50`}
          onClick={onClick}
          disabled={disabled}
      >
        {promptText}
      </button>
    )
}