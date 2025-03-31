import React, { ReactNode } from 'react'
import { YStack, XStack, SizableText } from 'tamagui'

interface SettingsSectionProps {
  title: string
  children: ReactNode
  footnote?: string | ReactNode
  error?: string | ReactNode
}

interface SettingsRowProps {
  title: string
  description?: string
  control: ReactNode
  divider?: boolean
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, footnote, error }) => (
  <YStack px="$4" backgroundColor="$gray1" width="100%" height="100%" justifyContent="space-between">
    <YStack>
      <h2 className="mb-2">{title}</h2>
      <XStack className="h-[2px] w-full bg-neutral-700" />
      <YStack maxWidth="100%" width="100%" overflow="hidden">
        {children}
        {error && (
          <SizableText size="$1" color="$red" py="$2">
            {error}
          </SizableText>
        )}
      </YStack>
    </YStack>
    {footnote && (
      <SizableText size="$1" py="$2">
        {footnote}
      </SizableText>
    )}
  </YStack>
)

export const SettingsRow: React.FC<SettingsRowProps> = ({ title, description, control, divider = true }) => {
  return (
    <>
      <XStack width="100%">
        <XStack justifyContent="space-between" alignItems="center" py="$3" width="100%">
          <YStack flex={1} pr="$4">
            <SizableText size="$3" fontWeight="semi-bold">
              {title}
            </SizableText>
            {description && (
              <SizableText size="$1" py="$2">
                {description}
              </SizableText>
            )}
          </YStack>
          {control}
        </XStack>
      </XStack>
      {divider && <XStack className="h-[2px] w-full bg-neutral-700" />}
    </>
  )
}

export default SettingsSection
