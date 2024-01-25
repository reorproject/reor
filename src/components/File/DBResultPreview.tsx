import { DBQueryResult } from "electron/main/database/Schema";
import React from "react";
import ReactMarkdown from "react-markdown";

interface DBResultPreview {
  dbResult: DBQueryResult;
  onSelect: (path: string) => void;
}

// Implement the SimilarEntryItem component
export const DBResultPreview: React.FC<DBResultPreview> = ({
  dbResult: entry,
  onSelect,
}) => {
  return (
    <div
      // className="pr-2 pb-1 mt-0 text-white pt-1 border-l-0 border-r-0 border-solid border-white pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg hover:bg-gray-700 transition-transform duration-300"
      // style={{ backgroundColor: "#1F2937" }}
      className="pr-2 pb-1 mt-0 text-white pt-1 rounded border-solid border-gray-600 bg-gray-800 border-[0.1px] pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg hover:bg-[#262f3b] transition-transform duration-300"
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown>{entry.content}</ReactMarkdown>
      <div className="text-xs text-gray-200">
        Vector distance: {entry._distance.toFixed(2)}
      </div>
    </div>
  );
};

interface DBSearchPreviewProps {
  dbResult: DBQueryResult;
  onSelect: (path: string) => void;
}

// Implement the SimilarEntryItem component
export const DBSearchPreview: React.FC<DBSearchPreviewProps> = ({
  dbResult: entry,
  onSelect,
}) => {
  return (
    <div
      // className="pr-2 pb-1 mt-0 text-white pt-1 border-l-0 border-r-0 border-solid border-white pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg hover:bg-gray-700 transition-transform duration-300"
      // style={{ backgroundColor: "#1F2937" }}
      className="overflow-x-none pb-1 mt-0 text-white pt-1 rounded border-solid border-gray-600 bg-gray-800 border-[0.1px] pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg hover:bg-[#262f3b] transition-transform duration-300"
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown className="">{entry.content}</ReactMarkdown>
      <div className="text-xs text-gray-200">
        Vector distance: {entry._distance.toFixed(2)}
      </div>
    </div>
  );
};

// export default DBResultPreview;

export function getFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts.pop() || ""; // Fallback to an empty string if the array is empty
}
