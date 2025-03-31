import React, { ComponentProps } from 'react'
import { YStack } from 'tamagui'

const Section = ({ children, ...props }: ComponentProps<typeof YStack>) => {
  return (
    <YStack borderBottomWidth={1} borderBottomColor="black" borderColor="$gray6" paddingVertical="$4" {...props}>
      {children}
    </YStack>
  )
}

export default Section
