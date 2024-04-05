import React from "react";
import { SuggestionsState } from "./TrReplaceSuggestions";

interface SuggestionsDisplayProps {
  suggestionsState: SuggestionsState;
}

const SuggestionsDisplay: React.FC<SuggestionsDisplayProps> = ({
  suggestionsState,
}) => {
  if (suggestionsState.suggestions.length === 0) {
    return null;
  }

  const handleClick = (suggestion: string) => {
    if (!suggestionsState.onSelect) return;
    suggestionsState.onSelect(suggestion);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: suggestionsState.position?.left ?? 0,
        top: suggestionsState.position?.top ?? 0,
        backgroundColor: "white",
        border: "1px solid black",
        padding: "10px",
        zIndex: 1000,
        maxWidth: "300px",
      }}
    >
      <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
        {suggestionsState.suggestions.map((suggestion, index) => (
          <li
            key={index}
            style={{ padding: "5px", cursor: "pointer" }}
            onClick={() => handleClick(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionsDisplay;
