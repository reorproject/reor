import React from "react";

import { formatDistanceToNow } from "date-fns"; // for human-readable time format
import { DBQueryResult } from "electron/main/vector-database/schema";
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
      className=" mt-0 max-w-full cursor-pointer overflow-hidden rounded border-[0.1px] border-solid border-gray-600 bg-neutral-800 px-2 py-1 text-slate-300 shadow-md transition-transform duration-300 hover:bg-neutral-700 hover:shadow-lg"
      onClick={() => {
        onSelect(entry.notepath);
      }}
    >
      <div className="max-h-60 overflow-y-auto">
        <ReactMarkdown
          className="break-words text-sm text-gray-200"
          components={{
            h1: (props) => <h1 className="leading-relaxed" {...props} />,
            pre: (props) => (
              <pre className="whitespace-pre-wrap break-all" {...props} />
            ),
            code: (props) => (
              <code className="whitespace-pre-wrap break-all" {...props} />
            ),
          }}
        >
          {entry.content}
        </ReactMarkdown>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {fileName && <span className="text-xs text-gray-400">{fileName} </span>}{" "}
        | Similarity: {cosineDistanceToPercentage(entry._distance)}% |{" "}
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
  const fileName = getFileName(entry.notepath);

  return (
    <div
      className="mb-4 mt-0 max-w-full cursor-pointer overflow-hidden rounded border border-gray-600 bg-neutral-800 p-2 shadow-md transition-transform duration-300 hover:bg-neutral-500 hover:shadow-lg"
      onClick={() => {
        onSelect(entry.notepath);
      }}
    >
      <div className="max-h-60 overflow-y-auto">
        <ReactMarkdown
          className="break-words text-sm text-gray-200"
          components={{
            h1: (props) => <h1 className="leading-relaxed" {...props} />,
            pre: (props) => (
              <pre className="whitespace-pre-wrap break-all" {...props} />
            ),
            code: (props) => (
              <code className="whitespace-pre-wrap break-all" {...props} />
            ),
          }}
        >
          {entry.content}
        </ReactMarkdown>
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {fileName && <span className="text-xs text-gray-400">{fileName} </span>}{" "}
        | Similarity: {cosineDistanceToPercentage(entry._distance)}% |{" "}
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
  return parts.pop() ?? "";
}

const formatModifiedDate = (date: Date) => {
  if (isNaN(new Date(date).getTime())) {
    return "";
  }
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
