import { DBEntry, DBResult } from "electron/main/database/LanceTableWrapper";
import ReactMarkdown from "react-markdown";

interface DBResultPreview {
  dbResult: DBResult;
  onSelect: (path: string) => void;
}

// Implement the SimilarEntryItem component
const DBResultPreview: React.FC<DBResultPreview> = ({
  dbResult: entry,
  onSelect,
}) => {
  return (
    <div
      className="pr-2 pb-1 mt-0 text-white pt-1 border-l-0 border-r-0 border-solid border-white pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg hover:bg-gray-700 transition-transform duration-300"
      // style={{ backgroundColor: "#1F2937" }}
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown>{entry.content}</ReactMarkdown>
      <div className="text-xs text-gray-200">
        Vector distance: {entry._distance.toFixed(2)}
      </div>
    </div>
  );
};

export default DBResultPreview;
