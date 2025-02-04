import { ComponentProps } from 'react'
import { YStack } from 'tamagui'

export function Section({ children, ...props }: ComponentProps<typeof YStack>) {
  return (
    <YStack borderBottomWidth={1} borderBottomColor="black" borderColor="$gray6" paddingVertical="$4" {...props}>
      {children}
    </YStack>
  )
}
