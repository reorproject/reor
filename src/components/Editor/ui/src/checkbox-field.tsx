import { Checkbox } from '@tamagui/checkbox'
import { Label } from '@tamagui/label'
import { Check } from '@tamagui/lucide-icons'
import { XStack } from '@tamagui/stacks'
import React from 'react'

export function CheckboxField({
  value,
  onValue,
  labelProps,
  children,
  id,
  ...props
}: {
  value: boolean
  onValue: (value: boolean) => void
  labelProps?: React.ComponentProps<typeof Label>
  children: React.ReactNode | string
  id: string
} & React.ComponentProps<typeof XStack>) {
  return (
    <XStack {...props} gap="$3" ai="center">
      <Checkbox
        borderColor="$color9"
        id={id}
        focusStyle={{
          borderColor: '$color9',
        }}
        checked={typeof value == 'boolean' ? value : 'indeterminate'}
        onCheckedChange={onValue}
        hoverStyle={{
          borderColor: '$color9',
        }}
      >
        <Checkbox.Indicator>
          <Check />
        </Checkbox.Indicator>
      </Checkbox>
      <Label color="$color10" {...labelProps} htmlFor={id}>
        {children}
      </Label>
    </XStack>
  )
}
