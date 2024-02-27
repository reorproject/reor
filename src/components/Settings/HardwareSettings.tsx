import { HardwareConfig } from "electron/main/Store/storeConfig";
import React, { useEffect, useState } from "react";
import Switch from "react-switch"; // Import the switch component

interface HardwareSettingsProps {}

const HardwareSettings: React.FC<HardwareSettingsProps> = () => {
  const [hardware, setHardware] = useState<HardwareConfig>({
    useGPU: false,
    useCUDA: false,
    useVulkan: false,
  });
  const [error, setError] = useState<string | null>(null); // State to handle errors

  useEffect(() => {
    const hardwareConfig = window.electronStore.getHardwareConfig();
    setHardware(
      hardwareConfig || {
        useGPU: false,
        useCUDA: false,
        useVulkan: false,
      }
    );
  }, []);

  const handleToggle = (field: keyof HardwareConfig) => {
    // Directly toggle the field first
    const updatedValue = !hardware[field];
    let updatedHardware = { ...hardware, [field]: updatedValue };

    // Enforce rule: only one of CUDA or Vulkan can be set
    if (field === "useCUDA" && updatedValue) {
      updatedHardware = { ...updatedHardware, useVulkan: false };
    } else if (field === "useVulkan" && updatedValue) {
      updatedHardware = { ...updatedHardware, useCUDA: false };
    }

    // Adjust useGPU based on useCUDA or useVulkan changes
    if (field === "useCUDA" || field === "useVulkan") {
      if (!updatedHardware.useCUDA && !updatedHardware.useVulkan) {
        // Do not automatically turn off GPU if both are off.
        // Let the user turn off GPU manually if needed.
      } else {
        // Automatically enable GPU if either CUDA or Vulkan is enabled
        updatedHardware.useGPU = true;
      }
    } else if (field === "useGPU") {
      // If toggling GPU directly, just update without additional logic
    }

    // Finally, update the state and persist the new configuration
    setHardware(updatedHardware);
    window.electronStore.setHardwareConfig(updatedHardware);

    // Reset or set error message as needed
    setError(null);
  };

  return (
    <div className="w-full bg-gray-800 rounded pb-7">
      <div className="flex items-center justify-between p-4">
        <label>Use GPU</label>
        <Switch
          checked={hardware.useGPU}
          onChange={() => handleToggle("useGPU")}
          // No need for disabled here, as manual control is allowed
        />
      </div>
      <div className="flex items-center justify-between p-4">
        <label>Use CUDA</label>
        <Switch
          checked={hardware.useCUDA}
          onChange={() => handleToggle("useCUDA")}
        />
      </div>
      <div className="flex items-center justify-between p-4">
        <label>Use Vulkan</label>
        <Switch
          checked={hardware.useVulkan}
          onChange={() => handleToggle("useVulkan")}
        />
      </div>
      {error && <div className="text-red-500 text-center">{error}</div>}
    </div>
  );
};

export default HardwareSettings;
