import { removeFileExtension } from "@/functions/strings";
import React, { useRef, useEffect, useState, useMemo } from "react";

interface SuggestionsState {
  text: string;
  position: { top: number; left: number };
  onSelect?: (suggestion: string) => void;
}

interface SuggestionsDisplayProps {
  suggestionsState: SuggestionsState;
  suggestions: string[];
}

const InEditorBacklinkSuggestionsDisplay: React.FC<SuggestionsDisplayProps> = ({
  suggestionsState,
  suggestions,
}) => {
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState({
    top: -9999,
    left: -9999,
    display: "none",
  });

  const filteredSuggestions = useMemo(() => {
    if (!suggestionsState.text) return [];
    const lowerCaseText = suggestionsState.text.toLowerCase();
    return suggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(lowerCaseText))
      .map(removeFileExtension)
      .slice(0, 5);
  }, [suggestions, suggestionsState.text]);

  useEffect(() => {
    if (
      !suggestionsState.position ||
      filteredSuggestions.length === 0 ||
      !suggestionsRef.current
    ) {
      return;
    }
    const { top, left } = suggestionsState.position;
    const { height, width } = suggestionsRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const shouldDisplayAbove = top + height > viewportHeight && top > height;

    setLayout({
      top: shouldDisplayAbove ? top - height : top,
      left: left,
      display: "block",
    });
  }, [suggestionsState.position, filteredSuggestions]);

  if (filteredSuggestions.length === 0) return null;

  return (
    <div
      ref={suggestionsRef}
      style={{
        position: "absolute",
        left: `${layout.left}px`,
        top: `${layout.top}px`,
        display: layout.display,
        backgroundColor: "white",
        border: "1px solid black",
        padding: "10px",
        zIndex: 1000,
        maxWidth: "300px",
        overflowWrap: "break-word",
        whiteSpace: "normal",
      }}
    >
      <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
        {filteredSuggestions.map((suggestion, index) => (
          <li
            key={index}
            style={{ padding: "5px", cursor: "pointer" }}
            onClick={() => {
              suggestionsState.onSelect?.(suggestion);
            }}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InEditorBacklinkSuggestionsDisplay;
