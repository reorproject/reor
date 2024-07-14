import { Button } from '@material-tailwind/react'
import React from 'react'

const SettingsRow: React.FC<{
  title: string
  description?: string
  buttonText?: string
  onClick?: () => void
  children?: React.ReactNode
}> = ({ title, description, buttonText, onClick, children }) => (
  <div className="flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2">
    <div className="flex-col">
      <p className="mt-5 text-gray-100">
        {title}
        {description && <p className="m-0 pt-1 text-xs text-gray-100 opacity-40">{description}</p>}
      </p>
    </div>
    <div className="flex">
      {buttonText && (
        <Button
          className="flex min-w-[192px] cursor-pointer items-center justify-between rounded-md border border-none border-gray-300 bg-dark-gray-c-eight py-2 font-normal hover:bg-dark-gray-c-ten"
          onClick={onClick}
          placeholder=""
        >
          {buttonText}
        </Button>
      )}
      {children}
    </div>
  </div>
)

export default SettingsRow