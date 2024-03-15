import { HardwareConfig } from "electron/main/Store/storeConfig";
import React, { useEffect, useState } from "react";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button } from "@material-tailwind/react";
import ExternalLink from "../Generic/ExternalLink";

interface HardwareSettingsProps {}

const HardwareSettings: React.FC<HardwareSettingsProps> = () => {
  const [hardware, setHardware] = useState<HardwareConfig>({
    useGPU: false,
    useCUDA: false,
    useVulkan: false,
  });
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [changesPending, setChangesPending] = useState(false);

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
    // window.electronStore.setHardwareConfig(updatedHardware);
    setChangesPending(true);

    // Reset or set error message as needed
    setError(null);
  };

  const handleSave = () => {
    // Execute the save function here
    window.electronStore.setHardwareConfig(hardware);
    setChangesPending(false);
  };

  const customSwitchStyle = (color: string) => ({
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: color,
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
      },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      backgroundColor: color,
    },
  });

  return (
    <div className="w-full bg-neutral-900 rounded text-gray-100">
      <h2 className="text-2xl font-semibold mb-0">Hardware</h2>
      <p className="mt-2 text-sm text-gray-100 mb-1">
        This is the hardware that the will be used to run local LLMs:
      </p>
      <FormGroup className="mb-4">
        <FormControlLabel
          control={
            <Switch
              checked={hardware?.useGPU}
              onChange={() => handleToggle("useGPU")}
              sx={customSwitchStyle("white")} // Teal for GPU
            />
          }
          label="Use GPU"
          labelPlacement="start"
          className="justify-between"
        />
        <FormControlLabel
          control={
            <Switch
              checked={hardware?.useCUDA}
              onChange={() => handleToggle("useCUDA")}
              sx={customSwitchStyle("white")} // Green for CUDA
            />
          }
          label="CUDA"
          labelPlacement="start"
          className="justify-between"
        />
        <FormControlLabel
          control={
            <Switch
              checked={hardware?.useVulkan}
              onChange={() => handleToggle("useVulkan")}
              sx={customSwitchStyle("white")} // Purple for Vulkan
            />
          }
          label="Vulkan"
          labelPlacement="start"
          className="justify-between"
        />
      </FormGroup>
      <p className="text-xs text-gray-100">
        You don&apos;t need to worry about this unless you have a dedicated GPU.
        Enable CUDA for NVIDIA GPUs and Vulkan for AMD. See{" "}
        <ExternalLink
          url="https://reorproject.org/docs/documentation/gpus"
          label="docs"
        />{" "}
        for more info.
      </p>
      {changesPending && (
        <div className="flex">
          <Button
            // variant="contained"
            placeholder={""}
            onClick={handleSave}
            className="bg-neutral-700 w-[150px] border-none h-8 hover:bg-neutral-900 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mt-2 mb-3 mr-4"
          >
            Save Changes
          </Button>
          <p className="text-xs text-gray-100 mt-2">
            You&apos;ll need to refresh the chat window to apply these changes.
          </p>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default HardwareSettings;
