import React from "react";
import ExternalLink from "../Generic/ExternalLink";

interface HardwareSettingsProps {}

const HardwareSettings: React.FC<HardwareSettingsProps> = () => {
  return (
    <div className="w-full bg-neutral-800 rounded text-gray-100">
      <h2 className="text-2xl font-semibold mb-0">Hardware</h2>
      <p className="mt-2 text-sm text-gray-100 mb-1">
        Reor is now powered by{" "}
        <ExternalLink href="https://ollama.com">Ollama</ExternalLink>. That
        means, you will need to install{" "}
        <ExternalLink href="https://ollama.com">Ollama</ExternalLink> and make
        sure that it is running at the same time as Reor is to use your Nvidia
        or AMD GPU. Check out Ollama&apos;s{" "}
        <ExternalLink href="https://github.com/ollama/ollama/blob/main/docs/gpu.md">
          docs page
        </ExternalLink>{" "}
        for more info on GPUs.
      </p>
    </div>
  );
};

export default HardwareSettings;
