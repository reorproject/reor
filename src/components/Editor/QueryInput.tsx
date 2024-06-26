import React, { useState } from "react";

import { ChatMessageToDisplay } from "../Chat/Chat";

/*
 * Contains the options that users can query on
 */
enum QueryOptions {
  summarize = "summarize",
  details = "details",
  analyze = "analyze",
  format = "format",
}

/**
 * Represents a query with a specified action and its associated arguments
 */
export interface Query {
  /**
   * The query operation to be performed.
   */
  options: QueryOptions;

  /**
   * Query a remote page
   */
  remote: boolean;

  /**
   * The arguments associated with the query operation.
   * Args is constructed in the following way:
   *    1) :summarize [URL]
   *    2) :ask [URL] "What is the main argument of this article" "How can we .." ...
   *    3) :analyze [URL] "What does page 4 explain?"
   *
   * In this case, everything after the cmd option is stored at an index in args starting at 0.
   * If remote is true, then URL is stored at args[0]
   */
  args: string[];

  /**
   * Path where query is made
   */
  filePath: string;

  /**
   * Response of Query
   */
  displayableChatHistory: ChatMessageToDisplay[];
}

/**
 * Regex for getting content between quotes
 */
const quotePattern = /^"(.+)"$/;

interface QueryInputProps {
  setShowQueryBox: (show: boolean) => void;
  filePath: string;
  setShowQueryWindow: (show: boolean) => void;
  setQuery: (query: Query) => void;
}

const QueryInput: React.FC<QueryInputProps> = ({
  setShowQueryBox,
  filePath,
  setShowQueryWindow,
  setQuery,
}) => {
  const [input, setInput] = useState(":");
  // const [query, setQuery] = useState<Query | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestChoice, setSuggestChoice] = useState<number>(0);

  const handleKeyDown = (event: any) => {
    const length = Object.values(QueryOptions).length;

    if (event.key === " ") {
      const command: string = input.slice(1).trim().split(" ")[0];
      if (!QueryOptions[command]) {
        event.preventDefault();
      }
    } else if (event.key === "Enter") {
      // Suggestion windows is open
      if (suggestions.length > 0) {
        const newInput = ":" + suggestions[suggestChoice] + " ";
        setInput(newInput);
        updateSuggestions(newInput);
      } else {
        /* Set up new Query Object*/
        createQuery();
        setShowQueryWindow(true);
      }
    } else if (event.key === "Escape") {
      /* Close query box */
      setShowQueryBox(false);
    } else if (event.key === "ArrowUp") {
      /* Select new choice for suggestion */
      setSuggestChoice((suggestChoice - 1 + length) % length);
    } else if (event.key === "ArrowDown") {
      setSuggestChoice((suggestChoice + 1) % length);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    // Ensure the input always starts with ':'
    if (value.startsWith(":")) {
      setInput(value);
      updateSuggestions(value);
    }
  };

  /**
   * Creates options that exist in the enum that the user may be typing.
   */
  const updateSuggestions = (currentInput) => {
    const commandStart = currentInput.slice(1);
    const filteredSuggestions = Object.values(QueryOptions).filter((option) =>
      option.startsWith(commandStart)
    );
    setSuggestions(filteredSuggestions);
  };

  const createQuery = () => {
    // Extract command
    const commandMatch = input.match(/^:([a-z]+)\s+(.*)$/i);
    if (!commandMatch) {
      console.error("No valid command found.");
      return;
    }
    const command = commandMatch[1];
    const content = commandMatch[2];
    let newQuery = null;
    switch (command) {
      case "summarize":
        newQuery = handleSummarizeCommand(content);
        break;
      case "format":
        newQuery = handleFormatCommand(content, filePath);
        break;
      default:
        break;
    }

    if (newQuery) {
      setQuery(newQuery);
    }
  };

  /**
   * Constructs the Query object when summarize command is invoked
   */
  const handleSummarizeCommand = (content: string) => {
    // Regex to match exactly one URL enclosed in square brackets
    const summarizePattern = /^\[\s*https?:\/\/[^\s\]]+\s*\]$/i;
    if (!summarizePattern.test(content.trim())) {
      console.error(
        "Invalid argument for summarize command. Expected a URL within square brackets."
      );
      return;
    }

    // If valid, extract URL and build the query object
    const url = content.slice(1, -1); // Remove the square brackets
    return {
      options: QueryOptions.summarize,
      remote: true,
      args: [url],
      // filePath:
    };
  };

  /**
   * Constructs the Query object when format command is invoked
   */
  const handleFormatCommand = (content: string, filePath: string) => {
    const match = content.match(quotePattern);
    if (match) {
      const args = match[1];
      return {
        options: QueryOptions.format,
        remote: false,
        args: [args],
        filePath: filePath,
        displayableChatHistory: [],
      };
    }
  };

  return (
    <div>
      {suggestions.length > 0 && (
        <ul className="absolute bottom-full left-0 right-0 z-10 bg-transparent border border-gray-300 list-none p-0 m-0 max-h-40 overflow-y-auto w-[100px] text-sm">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`${index === suggestChoice ? "bg-white" : ""
                } pl-4 py-1 cursor-pointer hover:bg-gray-200`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      <input
        type="text"
        value={input}
        placeholder="Enter query..."
        className="w-full bg-light-arsenic p-2 text-white"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setShowQueryBox(false)}
        autoFocus
      />
    </div>
  );
};

export default QueryInput;
