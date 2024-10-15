import React from 'react'
import { Button } from '@/components/ui/button'

const SettingsRow: React.FC<{
  title: string
  description?: string
  buttonText?: string
  onClick?: () => void
  children?: React.ReactNode
}> = ({ title, description, buttonText, onClick, children }) => (
  <div className="flex w-full flex-wrap items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2">
    <div className="max-w-[50%] flex-col">
      <p className="mt-5 text-gray-100">
        {title}
        {description && <span className="block pt-1 text-xs text-gray-100 opacity-40">{description}</span>}
      </p>
    </div>
    <div className="flex">
      {buttonText && (
        <Button variant="secondary" onClick={onClick}>
          {buttonText}
        </Button>
      )}
      {children}
    </div>
  </div>
)

export default SettingsRow
