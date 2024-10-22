/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/prefer-default-export */
import React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/ui'

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
}

const Checkbox: React.FC<CheckboxProps> = ({ className, label, id, ...props }) => {
  return (
    <div className="flex items-center">
      <CheckboxPrimitive.Root
        id={id}
        className={cn(
          'shadow-blackA4 hover:bg-violet3 flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[4px] bg-white shadow-[0_2px_10px] outline-none focus:shadow-[0_0_0_2px_black]',
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator>
          <CheckIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label className="pl-[15px] text-[15px] leading-none text-white" htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  )
}

export { Checkbox }
