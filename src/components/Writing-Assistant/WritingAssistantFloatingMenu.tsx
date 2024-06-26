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
      case "summarize":
        response = await getLLMResponse("summarize", selectedText);
        break;
      case "translate":
        response = await getLLMResponse("translate", selectedText);
        break;
      case "expand":
        response = await getLLMResponse("expand", selectedText);
        break;
    }

    displayLLMResponse(response);
  };

  const getLLMResponse = async (action: string, text: string) => {
    // Implement the logic to get a response from the LLM
    // This is a placeholder implementation
    return { content: `Response for ${action}: ${text}` };
  };

  const displayLLMResponse = (response: { content: string }) => {
    // Implement the logic to display the LLM response
    alert(response.content); // Simple alert for demonstration
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
      <button onClick={() => handleOption("summarize")}>Summarize</button>
      <button onClick={() => handleOption("translate")}>Translate</button>
      <button onClick={() => handleOption("expand")}>Expand</button>
    </div>
  );
};

export default FloatingMenu;
