import React, { useState, useEffect } from 'react'

import Switch from '@mui/material/Switch'
import posthog from 'posthog-js'
import { YStack, XStack, SizableText } from 'tamagui'

interface AnalyticsSettingsProps {}
const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = () => {
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState<boolean>(false)

  useEffect(() => {
    const fetchParams = async () => {
      const storedIsAnalyticsEnabled = await window.electronStore.getAnalyticsMode()

      if (storedIsAnalyticsEnabled !== undefined) {
        console.log(`Stored analytics: ${storedIsAnalyticsEnabled}`)
        setIsAnalyticsEnabled(storedIsAnalyticsEnabled)
      }
    }

    fetchParams()
  }, [])

  const handleSave = () => {
    // Execute the save function here
    if (isAnalyticsEnabled !== undefined) {
      window.electronStore.setAnalyticsMode(!isAnalyticsEnabled)
      setIsAnalyticsEnabled(!isAnalyticsEnabled)
      posthog.capture('analytics_disabled')
    }
  }

  return (
    <YStack px="$4" backgroundColor="$gray1" maxWidth="100%">
      <h2 className="mb-0">Analytics</h2>
      <YStack maxWidth="100%" width="100%" overflow="hidden" py="$4">
        <XStack className="h-[2px] w-full bg-neutral-700" />
        <XStack>
          <XStack justifyContent="space-between" alignItems="center" py="$3" width="100%">
            <SizableText size="$2">
              Reor tracks anonymous usage data to help us understand how the app is used and which features are popular.
              You can disable this at any time:
            </SizableText>
            <Switch
              checked={isAnalyticsEnabled}
              onChange={handleSave}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </XStack>
        </XStack>
      </YStack>
    </YStack>
  )
}

export default AnalyticsSettings
