import React from "react";

import { HighlightData } from "../Editor/HighlightExtension";

const FloatingMenu: React.FC<{ highlightData: HighlightData }> = ({
  highlightData,
}) => {
  if (!highlightData.position) return null;

  const handleOption = async (option: string) => {
    const selectedText = highlightData.text;
    let response;

    switch (option) {
      case "simplify":
        response = await getLLMResponse("simplify", selectedText);
        break;
      case "copy-editor":
        response = await getLLMResponse("copy-editor", selectedText);
        break;
      case "takeaways":
        response = await getLLMResponse("takeaways", selectedText);
        break;
    }

    displayLLMResponse(response);
  };

  const getLLMResponse = async (mode: string, text: string) => {
    // Implement the logic to get a response from the LLM
    // This is a placeholder implementation
    const defaultLLMName = await window.llm.getDefaultLLMName();
    const llmConfigs = await window.llm.getLLMConfigs();

    const currentModelConfig = llmConfigs.find(
      (config) => config.modelName === defaultLLMName
    );
    if (!currentModelConfig) {
      throw new Error(`No model config found for model: ${defaultLLMName}`);
    }
    const result = await window.llm.writingAssistant(
      defaultLLMName,
      text,
      mode
    );
    return result;
  };

  const displayLLMResponse = (result: string) => {
    // Implement the logic to display the LLM response
    console.log(result); // Simple alert for demonstration
  };

  return (
    <div
      style={{
        position: "absolute",
        top: highlightData.position.top,
        left: highlightData.position.left,
        background: "white",
        border: "1px solid #ccc",
        padding: "10px",
        zIndex: 1000,
      }}
    >
      <button onClick={() => handleOption("simplify")}>Simplify</button>
      <button onClick={() => handleOption("copy-editor")}>Copy Editor</button>
      <button onClick={() => handleOption("takeaways")}>Key Takeaways</button>
    </div>
  );
};

export default FloatingMenu;
