import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import Switch from "@mui/material/Switch";
import posthog from "posthog-js";

interface AnalyticsSettingsProps {}
const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = () => {
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState<boolean>(false);

  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false);

  useEffect(() => {
    const fetchParams = async () => {
      const isAnalyticsEnabled = await window.electronStore.getAnalyticsMode();

      if (isAnalyticsEnabled !== undefined) {
        setIsAnalyticsEnabled(isAnalyticsEnabled);
      }
    };

    fetchParams();
  }, []);

  const handleSave = () => {
    // Execute the save function here
    if (isAnalyticsEnabled !== undefined) {
      window.electronStore.setAnalyticsMode(isAnalyticsEnabled);
      setUserHasMadeUpdate(false);
    }
  };

  return (
    <div className="w-full bg-neutral-800 rounded pb-7 ">
      <h2 className="text-2xl font-semibold mb-0 text-white">Analytics mode</h2>{" "}
      <p className="text-gray-300 text-sm mb-2 mt-1">
        Reor tracks anonymous usage data to help improve the app. We never send
        any personal data. This is solely to track which features are popular.
        You can disable this at any time:
      </p>
      <Switch
        checked={isAnalyticsEnabled}
        onChange={() => {
          setUserHasMadeUpdate(true);
          setIsAnalyticsEnabled(!isAnalyticsEnabled);
          if (isAnalyticsEnabled) {
            posthog.capture("analytics_disabled");
          }
        }}
        inputProps={{ "aria-label": "controlled" }}
      />
      {userHasMadeUpdate && (
        <div className="flex">
          <Button
            // variant="contained"
            placeholder={""}
            onClick={handleSave}
            className="bg-orange-700 w-[150px] border-none h-8 hover:bg-orange-900 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mb-0 mr-4 mt-2"
          >
            Save
          </Button>
        </div>
      )}
      {!isAnalyticsEnabled && (
        <p className="text-yellow-500 text-xs">
          Quit and restart the app for it to take effect
        </p>
      )}
    </div>
  );
};

export default AnalyticsSettings;
