import React from "react";
import type { FC } from "react";

interface Props {
  promptText: string;
  onClick?: () => void;
}

export const ChatPrompt: FC<Props> = ({ promptText, onClick } : Props) => {
    return (
      <button
        className={`
            rounded bg-gray-200 p-5 shadow dark:bg-gray-700 text-white text-base
            hover:bg-gray-300 hover:text-black cursor-pointer
            border-solid border border-white border-opacity-50`}
          onClick={onClick}
      >
        {promptText}
      </button>
    )
}