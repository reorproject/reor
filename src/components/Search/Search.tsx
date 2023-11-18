import React, { useState } from "react";

export interface RagnoteDBEntry {
  notepath: string;
  vector?: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
}

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RagnoteDBEntry[]>([]);

  const handleSearch = async () => {
    const results: RagnoteDBEntry[] = await window.database.search(
      searchQuery,
      10
    );
    setSearchResults(results);
  };

  return (
    <div className="p-4">
      <input
        type="text"
        className="border border-gray-300 p-2 rounded-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={handleSearch}
      >
        Search
      </button>
      <div className="mt-4">
        {searchResults.map((result, index) => (
          <div key={index} className="border-b border-gray-300 py-2">
            <p className="font-semibold">{result.notepath}</p>
            <p>{result.content}</p>
            <p className="text-sm text-gray-600">
              Added: {result.timeadded.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchComponent;
