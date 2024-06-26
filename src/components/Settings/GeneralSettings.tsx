import React from "react";

import CreateAppearanceSection from "./GeneralSections";

/*
 *  General Page has the following format:
 *
 * SubHeader 1
 * =============
 *
 * OptionA for subheader
 * ----------------------
 * OptioNB for subheader
 * ---------------------
 *
 * SubHeader 2
 * =============
 *
 *
 * SubHeader describe the part of the project you are changing (appearance, editor, sidebar, etc..). Option(s) is the name of the specific change.
 */

const GeneralSettings: React.FC<GenSettingsProps> = ({ }) => {
  return (
    <div className="w-full flex-col justify-between bg-dark-gray-c-three rounded">
      <h2 className="text-2xl font-semibold mb-0 text-white">General</h2>
      <CreateAppearanceSection />
    </div>
  );
};

export default GeneralSettings;
