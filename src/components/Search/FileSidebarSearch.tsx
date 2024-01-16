import { DBResult } from "electron/main/database/LanceTableWrapper";
import React, { useState, useEffect, useRef } from "react";
import DBResultPreview from "../File/DBResultPreview";

interface SearchComponentProps {
  onFileSelect: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: DBResult[];
  setSearchResults: (results: DBResult[]) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onFileSelect,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null); // Reference for the input field

  const handleSearch = async (query: string) => {
    const results: DBResult[] = await window.database.search(query, 20);
    setSearchResults(results);
  };

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  const debouncedSearch = debounce((query: string) => handleSearch(query), 300);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div
      ref={containerRef}
      // style={{ height: "calc(100vh - 33px)" }}
      className="p-0.5"
    >
      <input
        ref={searchInputRef} // Attach the ref to the input
        type="text"
        className="border-none rounded-md p-2 w-full h-[7px]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Semantic search"
        // onBlur={() => setShowSearch(false)}
      />
      <div>
        {searchResults.length > 0 && (
          <div className="h-full overflow-x-none overflow-y-auto">
            {searchResults.map((result, index) => (
              <DBResultPreview
                key={index}
                dbResult={result}
                onSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const debounce = <F extends (...args: any[]) => void>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) => {
  let debounceTimer: NodeJS.Timeout;

  return (...args: Parameters<F>) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func(...args), delay);
  };
};

export default SearchComponent;
