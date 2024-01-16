import { DBEntry } from "electron/main/database/LanceTableWrapper";
import ReactMarkdown from "react-markdown";

interface FilePreviewProps {
  entry: DBEntry;
  onSelect: (path: string) => void;
}

// Implement the SimilarEntryItem component
const FilePreview: React.FC<FilePreviewProps> = ({ entry, onSelect }) => {
  return (
    <div
      className="pr-2 pb-1 mt-0 text-white pt-1 border-l-0 border-r-0 border-solid border-white pl-2 shadow-md cursor-pointer hover:scale-104 hover:shadow-lg transition-transform duration-300"
      style={{ backgroundColor: "#1F2937" }}
      onClick={() => onSelect(entry.notepath)}
    >
      <ReactMarkdown>{entry.content}</ReactMarkdown>
    </div>
  );
};

export default FilePreview;
