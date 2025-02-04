import { IconProps } from '@tamagui/helpers-icon'
import { Label } from '@tamagui/label'
import { YStack } from '@tamagui/stacks'
import { NamedExoticComponent, PropsWithChildren } from 'react'
import { Input, InputProps, Switch, SwitchProps, XStack } from 'tamagui'
import { SelectDropdown, SelectDropdownProps, SelectOptions } from './select-dropdown'

export function Field({ id, label, children }: PropsWithChildren<{ label: string; id: string }>) {
  return (
    <YStack gap="$1" f={1}>
      <Label htmlFor={id} size="$1" color="$color9">
        {label}
      </Label>
      {children}
    </YStack>
  )
}

export function TextField({
  label,
  Icon,
  id,
  ...props
}: InputProps & {
  label?: string
  Icon?: NamedExoticComponent<IconProps>
  id: string
}) {
  let content = (
    <XStack
      ai="center"
      gap="$2"
      borderWidth={1}
      borderColor="$color8"
      borderRadius="$2"
      paddingHorizontal="$2"
      animation="fast"
    >
      {Icon && <Icon size={14} />}
      <Input
        borderWidth={0}
        // @ts-ignore
        outline="none"
        unstyled
        w="100%"
        autoFocus
        size="$2"
        {...props}
      />
    </XStack>
  )

  if (label) {
    return (
      <YStack gap="$1">
        <Label htmlFor={id} size="$1" color="$color9">
          {label}
        </Label>
        {content}
      </YStack>
    )
  } else {
    return content
  }
}

export function SelectField({
  label,
  Icon,
  id,
  options,
  value,
  onValue,
  ...props
}: SelectDropdownProps<SelectOptions> & {
  label?: string
  Icon?: NamedExoticComponent<IconProps>
  id: string
}) {
  let content = (
    <XStack ai="center" gap="$2" borderWidth={1} borderColor="$color5" borderRadius="$2" animation="fast" bg="red">
      <SelectDropdown width="100%" options={options} value={value} onValue={onValue} {...props} />
    </XStack>
  )

  if (label) {
    return (
      <YStack gap="$1" w="100%">
        <Label htmlFor={id} size="$1" color="$color9">
          {label}
        </Label>
        {content}
      </YStack>
    )
  } else {
    return content
  }
}

export function SwitchField({ label, id, ...props }: SwitchProps & { label: string; id: string }) {
  return (
    <XStack w="100%" ai="center" jc="space-between">
      <Label f={1} htmlFor={id} size="$1" color="$color9">
        {label}
      </Label>

      <Switch size="$2" {...props} defaultChecked={props.defaultChecked} borderColor="$brand5">
        <Switch.Thumb animation="fast" bg="$brand5" borderColor="$background" borderWidth={2} />
      </Switch>
    </XStack>
  )
}
