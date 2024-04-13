import React from "react";
import type { FC } from "react";

interface Props {
  actionText: string;
  onClick?: () => void;
}

export const ChatAction: FC<Props> = ({ actionText, onClick }: Props) => {
  return (
    <button
      className={`
      rounded bg-neutral-800 p-5 shadow text-white text-base
      hover:bg-neutral-300 hover:text-black mt-2
      cursor-pointer
      border-solid border border-white border-opacity-50`}
      onClick={onClick}
    >
      {actionText}
    </button>
  );
};
