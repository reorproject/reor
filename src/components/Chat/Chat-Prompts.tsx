import type { FC } from "react";

export const ChatPrompt: FC = () => {
    return (
      <div
        className={`
            rounded bg-gray-200 p-5 shadow dark:bg-gray-700 text-white
            hover:bg-gray-300 hover:text-black
            border-solid border border-white border-opacity-50`}
      >
        Some hardcoded text here.
        </div>
    )
}