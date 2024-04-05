import React, { useRef, useEffect, useState } from "react";
import { SuggestionsState } from "./TrReplaceSuggestions";

interface SuggestionsDisplayProps {
  suggestionsState: SuggestionsState;
}

const SuggestionsDisplay: React.FC<SuggestionsDisplayProps> = ({
  suggestionsState,
}) => {
  const [positionStyle, setPositionStyle] = useState({ top: 0, left: 0 });
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suggestionsState.suggestions.length > 0 && suggestionsRef.current) {
      const suggestionBox = suggestionsRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      let topPosition = suggestionsState.position?.top ?? 0;

      // Check if the suggestion box is going off the bottom of the viewport
      if (topPosition + suggestionBox.height > viewportHeight) {
        // If it is, position it upwards instead
        topPosition = topPosition - suggestionBox.height;
      }

      setPositionStyle({
        top: topPosition,
        left: suggestionsState.position?.left ?? 0,
      });
    }
  }, [suggestionsState.position, suggestionsState.suggestions.length]);

  if (suggestionsState.suggestions.length === 0) {
    return null;
  }

  const handleClick = (suggestion: string) => {
    if (!suggestionsState.onSelect) return;
    suggestionsState.onSelect(suggestion);
  };

  return (
    <div
      ref={suggestionsRef}
      style={{
        position: "absolute",
        left: positionStyle.left,
        top: positionStyle.top,
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
