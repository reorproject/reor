import { Button } from "@material-tailwind/react";
import Switch from "@mui/material/Switch";
import React, { useEffect, useState } from "react";
import { useFileByFilepath } from "../File/hooks/use-file-by-filepath";

interface GeneralSettingsProps {}
const GeneralSettings: React.FC<GeneralSettingsProps> = () => {
  const { spellCheckEnabled, setSpellCheckEnabled } = useFileByFilepath();
  const [userHasMadeUpdate, setUserHasMadeUpdate] = useState(false);
  const [tempSpellCheckEnabled, setTempSpellCheckEnabled] = useState("false");

  useEffect(() => {
    const fetchParams = async () => {
      const isSpellCheckEnabled =
        await window.electronStore.getSpellCheckMode();

      if (isSpellCheckEnabled !== undefined) {
        setSpellCheckEnabled(isSpellCheckEnabled);
        setTempSpellCheckEnabled(isSpellCheckEnabled);
      }
    };

    fetchParams();
  }, [spellCheckEnabled]);

  const handleSave = () => {
    // Execute the save function here
    window.electronStore.setSpellCheckMode(tempSpellCheckEnabled);
    setSpellCheckEnabled(tempSpellCheckEnabled);
    setUserHasMadeUpdate(false);
  };

  return (
    <div className="w-full bg-neutral-800 rounded pb-7 ">
      <h2 className="text-2xl font-semibold mb-0 text-white">General</h2>{" "}
      <p className="text-gray-300 text-sm mb-2 mt-1">Spell Check</p>
      <Switch
        checked={tempSpellCheckEnabled == "true" ? true : false}
        onChange={() => {
          setUserHasMadeUpdate(true);
          if (tempSpellCheckEnabled == "true")
            setTempSpellCheckEnabled("false");
          else setTempSpellCheckEnabled("true");
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
      {
        <p className="text-yellow-500 text-xs">
          Quit and restart the app for it to take effect
        </p>
      }
    </div>
  );
};

export default GeneralSettings;
