import React, { useRef, useEffect, useState } from "react";
import { SuggestionsState } from "./BacklinkExtension";
import { removeFileExtension } from "@/functions/strings";

interface SuggestionsDisplayProps {
  suggestionsState: SuggestionsState;
  suggestions: string[];
}

const InEditorBacklinkSuggestionsDisplay: React.FC<SuggestionsDisplayProps> = ({
  suggestionsState,
  suggestions,
}) => {
  const [positionStyle, setPositionStyle] = useState({ top: 0, left: 0 });
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suggestionsState.position && suggestionsRef.current) {
      const suggestionBox = suggestionsRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      let topPosition = suggestionsState.position.top;

      if (topPosition + suggestionBox.height > viewportHeight) {
        topPosition = topPosition - suggestionBox.height;
      }

      setPositionStyle({
        top: topPosition,
        left: suggestionsState.position.left,
      });
    }
  }, [suggestionsState.position]);

  // Compute the filtered suggestions whenever the suggestions or the input text changes
  useEffect(() => {
    if (suggestionsState.text) {
      const lowerCaseText = suggestionsState.text.toLowerCase();
      const matchedSuggestions = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(lowerCaseText)
      );
      setFilteredSuggestions(
        matchedSuggestions.map(removeFileExtension).slice(0, 5)
      );
    } else {
      setFilteredSuggestions([]);
    }
  }, [suggestionsState.text, suggestions]);

  if (filteredSuggestions.length === 0) {
    return null;
  }

  const handleClick = (suggestion: string) => {
    suggestionsState.onSelect?.(suggestion);
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
        wordWrap: "break-word", // Ensures that long words do not overflow
        overflowWrap: "break-word", // A more modern, preferable alternative to wordWrap
        whiteSpace: "normal", // Ensures that the whitespace is handled in a standard way, allowing for wrapping
      }}
    >
      <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
        {filteredSuggestions.map((suggestion, index) => (
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

export default InEditorBacklinkSuggestionsDisplay;
