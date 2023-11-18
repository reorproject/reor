import React, { useState, useEffect, useRef } from "react";

export interface RagnoteDBEntry {
  notepath: string;
  vector?: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
}

interface SearchComponentProps {
  onFileSelect: (path: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onFileSelect }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<RagnoteDBEntry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (query: string) => {
    const results: RagnoteDBEntry[] = await window.database.search(query, 10);
    setSearchResults(results);
  };

  const debouncedSearch = debounce((query: string) => handleSearch(query), 300);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative p-0.5">
      <input
        type="text"
        className="border border-gray-300 rounded-md p-2 w-full h-[7px]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search"
      />
      <div className="absolute top-14 left-0 z-10 w-full bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto">
        {searchResults.map((result, index) => (
          <div
            key={index}
            className="border-b border-gray-300 p-2 cursor-pointer"
            onClick={() => onFileSelect(result.notepath)}
          >
            <p>{result.content}</p>
          </div>
        ))}
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
