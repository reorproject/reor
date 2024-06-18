import React, { useState } from "react";

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
interface Query {
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
}

/**
 * Regex for getting content between quotes
 */
const quotePattern = /^"(.+)"$/;

const QueryInput = ({ setShowQueryBox }) => {
  const [input, setInput] = useState(":");
  const [query, setQuery] = useState<Query | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestChoice, setSuggestChoice] = useState<number>(0);

  const handleKeyDown = (event) => {
    const length = Object.values(QueryOptions).length;

    if (event.key === " ") {
      const command = input.slice(1).trim().split(" ")[0];
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
        console.log("Did not select a choice!");
        /* Set up new Query Object*/
        parseInput();
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

  const parseInput = () => {
    // Extract command
    const commandMatch = input.match(/^:([a-z]+)\s+(.*)$/i);
    if (!commandMatch) {
      console.error("No valid command found.");
      return;
    }
    const command = commandMatch[1];
    const content = commandMatch[2];
    switch (command) {
      case "summarize":
        handleSummarizeCommand(content);
        break;
      case "format":
        handleFormatCommand(content);
        break;
      default:
        break;
    }
  };

  /**
   * Constructs the Query object when summarize command is invoked
   */
  const handleSummarizeCommand = (content: string) => {
    // Regex to match exactly one URL enclosed in square brackets
    const summarizePattern = /^\[\s*https?:\/\/[^\s\]]+\s*\]$/i;
    console.log(`content: ${content}`);
    if (!summarizePattern.test(content.trim())) {
      console.error(
        "Invalid argument for summarize command. Expected a URL within square brackets."
      );
      return;
    }

    // If valid, extract URL and build the query object
    const url = content.slice(1, -1); // Remove the square brackets
    const newQuery: Query = {
      options: QueryOptions.summarize,
      remote: true,
      args: [url],
    };

    setQuery(newQuery);
    console.log("Summarize command processed:", newQuery);
  };

  /**
   * Constructs the Query object when format command is invoked
   */
  const handleFormatCommand = (content: string) => {
    const match = content.match(quotePattern);
    if (match) {
      const args = match[1];
      const newQuery: Query = {
        options: QueryOptions.format,
        remote: false,
        args: [args],
      };

      setQuery(newQuery);
      console.log(`Format command processed:`, newQuery);
    }
  };

  return (
    <div>
      {suggestions.length > 0 && (
        <ul className="absolute bottom-full left-0 right-0 z-10 bg-transparent border border-gray-300 list-none p-0 m-0 max-h-40 overflow-y-auto w-[100px] text-sm">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`${
                index === suggestChoice ? "bg-white" : ""
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
        autoFocus
      />
    </div>
  );
};

export default QueryInput;
