import React, { useState, useEffect } from 'react'

import { Button } from '@material-tailwind/react'
import Switch from '@mui/material/Switch'
import posthog from 'posthog-js'

interface AnalyticsSettingsProps {}
const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = () => {
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState<boolean>(false)

  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false)

  useEffect(() => {
    const fetchParams = async () => {
      const storedIsAnalyticsEnabled = await window.electronStore.getAnalyticsMode()

      if (storedIsAnalyticsEnabled !== undefined) {
        setIsAnalyticsEnabled(storedIsAnalyticsEnabled)
      }
    }

    fetchParams()
  }, [])

  const handleSave = () => {
    // Execute the save function here
    if (isAnalyticsEnabled !== undefined) {
      window.electronStore.setAnalyticsMode(isAnalyticsEnabled)
      setUserHasMadeUpdate(false)
    }
  }

  return (
    <div className="w-full rounded bg-dark-gray-c-three pb-7 ">
      <h2 className="mb-0 text-2xl font-semibold text-white">Analytics</h2>{' '}
      <p className="mb-2 mt-5 text-sm text-gray-200">
        Reor tracks anonymous usage data to help improve the app. We never share this personal data. This is solely to
        track which features are popular. You can disable this at any time:
      </p>
      <Switch
        checked={isAnalyticsEnabled}
        onChange={() => {
          setUserHasMadeUpdate(true)
          setIsAnalyticsEnabled(!isAnalyticsEnabled)
          if (isAnalyticsEnabled) {
            posthog.capture('analytics_disabled')
          }
        }}
        inputProps={{ 'aria-label': 'controlled' }}
      />
      {userHasMadeUpdate && (
        <div className="flex">
          <Button
            // variant="contained"
            placeholder=""
            onClick={handleSave}
            className="mb-0 mr-4 mt-2 h-8 w-[150px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
          >
            Save
          </Button>
        </div>
      )}
      {!isAnalyticsEnabled && <p className="text-xs text-yellow-500">Quit and restart the app for it to take effect</p>}
    </div>
  )
}

export default AnalyticsSettings
