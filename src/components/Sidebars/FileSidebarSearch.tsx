import React, { useEffect, useRef } from "react";
import { DBSearchPreview } from "../File/DBResultPreview";
import { DBQueryResult } from "electron/main/database/Schema";

interface SearchComponentProps {
  onFileSelect: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: DBQueryResult[];
  setSearchResults: (results: DBQueryResult[]) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onFileSelect,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null); // Reference for the input field

  const handleSearch = async (query: string) => {
    const results: DBQueryResult[] = await window.database.search(query, 50);
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
    <div className="p-0.5  w-full">
      <div className="pr-1 pl-1">
        <input
          ref={searchInputRef}
          type="text"
          className="mt-1 w-full mr-5 h-8 bg-gray-800 text-white p-1 rounded-md  border-[2px] border-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic search..."
        />
      </div>

      <div className="mt-2 w-full">
        {searchResults.length > 0 && (
          <div className="w-full">
            {searchResults.map((result, index) => (
              <DBSearchPreview
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

const debounce = <F extends (...args: string[]) => Promise<void>>(
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
