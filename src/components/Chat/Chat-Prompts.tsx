import React from "react";
import type { FC } from "react";

interface Props {
  promptText: string;
  onClick?: () => void;
}

export const PromptSuggestion: FC<Props> = ({ promptText, onClick }: Props) => {
  return (
    <button
      className={`
            mt-2 cursor-pointer rounded border border-solid border-white/50
 bg-neutral-800 p-5
            text-base
            text-white shadow hover:bg-neutral-300 hover:text-black`}
      onClick={onClick}
    >
      {promptText}
    </button>
  );
};
