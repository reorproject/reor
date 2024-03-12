import { DBQueryResult } from "electron/main/database/Schema";
import React from "react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns"; // for human-readable time format

interface DBResultPreview {
  dbResult: DBQueryResult;
  onSelect: (path: string) => void;
}

export const DBResultPreview: React.FC<DBResultPreview> = ({
  dbResult: entry,
  onSelect,
}) => {
  const modified = formatModifiedDate(entry.filemodified);
  return (
    <div
      className="pr-2 pb-1 mt-0 text-white pt-1 rounded border-solid border-gray-600 bg-gray-800 border-[0.1px] pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg hover:bg-[#262f3b] transition-transform duration-300"
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown className="text-gray-200 truncate">
        {entry.content}
      </ReactMarkdown>
      <div className="text-xs text-gray-400 mt-0">
        Similarity: {cosineDistanceToPercentage(entry._distance)}% |{" "}
        {modified && (
          <span className="text-xs text-gray-400">Modified {modified}</span>
        )}
      </div>
    </div>
  );
};

interface DBSearchPreviewProps {
  dbResult: DBQueryResult;
  onSelect: (path: string) => void;
}

export const DBSearchPreview: React.FC<DBSearchPreviewProps> = ({
  dbResult: entry,
  onSelect,
}) => {
  const modified = formatModifiedDate(entry.filemodified);

  return (
    <div
      className="bg-gray-800 border border-gray-600 rounded shadow-md hover:shadow-lg transition-transform duration-300 cursor-pointer hover:scale-104 hover:bg-[#262f3b] mt-0 mb-4 p-2"
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown className="text-gray-200 break-words mt-0">
        {entry.content}
      </ReactMarkdown>
      <div className="text-xs text-gray-400 mt-0">
        Similarity: {cosineDistanceToPercentage(entry._distance)}% |{" "}
        {modified && (
          <span className="text-xs text-gray-400">Modified {modified}</span>
        )}
      </div>
    </div>
  );
};

const cosineDistanceToPercentage = (similarity: number) => {
  return ((1 - similarity) * 100).toFixed(2);
};

export function getFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts.pop() || "";
}

const formatModifiedDate = (date: Date) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return "";
  }
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
