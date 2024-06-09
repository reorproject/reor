import React from "react";

import { formatDistanceToNow } from "date-fns"; // for human-readable time format
import { DBQueryResult } from "electron/main/database/Schema";
import ReactMarkdown from "react-markdown";

interface DBResultPreview {
  dbResult: DBQueryResult;
  onSelect: (path: string) => void;
}

export const DBResultPreview: React.FC<DBResultPreview> = ({
  dbResult: entry,
  onSelect,
}) => {
  const modified = formatModifiedDate(entry.filemodified);
  const fileName = getFileName(entry.notepath);
  return (
    <div
      className="pr-2 pb-1 mt-0 text-slate-300 pt-1 rounded border-solid border-gray-600 bg-neutral-800 border-[0.1px] pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg hover:bg-neutral-700 transition-transform duration-300"
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown
        className="text-gray-200 break-words text-sm"
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          h1: ({ node, ...props }) => (
            <h1 className="leading-relaxed" {...props} />
          ),
        }}
      >
        {entry.content}
      </ReactMarkdown>
      <div className="text-xs text-gray-400 mt-0">
        {fileName && (
          <span className="text-xs text-gray-400">{fileName} </span>
        )} |{" "}
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
  const fileName = getFileName(entry.notepath)

  

  return (
    <div
      className="bg-neutral-800 border border-gray-600 rounded shadow-md hover:shadow-lg transition-transform duration-300 cursor-pointer hover:scale-104 hover:bg-neutral-500 mt-0 mb-4 p-2"
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown
        className="text-gray-200 break-words text-sm"
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          h1: ({ node, ...props }) => (
            <h1 className="leading-relaxed" {...props} />
          ),
        }}
      >
        {entry.content}
      </ReactMarkdown>
      <div className="text-xs text-gray-400 mt-0">
        {fileName && (
          <span className="text-xs text-gray-400">{fileName} </span>
        )} |{" "}
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
