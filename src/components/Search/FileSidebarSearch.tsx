import { RagnoteDBEntry } from "electron/main/database/Table";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa"; // Import the search icon
import ReactMarkdown from "react-markdown";

interface SearchComponentProps {
  onFileSelect: (path: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onFileSelect }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<RagnoteDBEntry[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null); // Reference for the input field

  const handleSearch = async (query: string) => {
    const results: RagnoteDBEntry[] = await window.database.search(query, 20);
    setSearchResults(results);
  };
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus(); // Automatically focus the input field when it appears
    }
  }, [showSearch]);

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
    <div ref={containerRef} className="p-0.5">
      {showSearch ? (
        <input
          ref={searchInputRef} // Attach the ref to the input
          type="text"
          className="border-none rounded-md p-2 w-[120px] h-[7px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic search"
          onBlur={() => setShowSearch(false)}
        />
      ) : (
        <FaSearch
          size={20}
          className="mt-0.5 cursor-pointer text-gray-100"
          onClick={() => setShowSearch(true)}
        />
      )}
      <div className="absolute z-20" style={{ height: "calc(100vh - 33px)" }}>
        {searchResults.length > 0 && (
          <div className=" z-10 h-full translate-x-[-80px] border  shadow-lg overflow-x-none overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="pr-2 pb-1 mt-0 w-[240px] text-white pt-1 border-l-1 border-r-1 border-solid border-white pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg transition-transform duration-300 overflow-x-auto word-break[break-all]"
                style={{ backgroundColor: "#1F2937" }}
                onClick={() => onFileSelect(result.notepath)}
              >
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>
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
