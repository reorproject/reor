import React, { useCallback, useEffect, useState } from "react";

import { Editor, EditorContent } from "@tiptap/react";

import InEditorBacklinkSuggestionsDisplay, {
  SuggestionsState,
} from "./BacklinkSuggestionsDisplay";
import EditorContextMenu from "./EditorContextMenu";

interface EditorManagerProps {
  editor: Editor | null;
  filePath: string;
  suggestionsState: SuggestionsState | null | undefined;
  flattenedFiles: { relativePath: string }[];
  showSimilarFiles: boolean;
}

const EditorManager: React.FC<EditorManagerProps> = ({
  editor,
  suggestionsState,
  flattenedFiles,
  showSimilarFiles,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  //   const [showSimilarFiles, setShowSimilarFiles] = useState(true);

  const toggleSearch = useCallback(() => {
    setShowSearch((prevShowSearch) => !prevShowSearch);
  }, []);

  useEffect(() => {
    console.log("showSimilarFiles", showSimilarFiles);
  }, [showSimilarFiles]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    editor?.commands.setSearchTerm(value);
  };

  const handleNextSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      editor?.commands.nextSearchResult();
      goToSelection();
      (event.target as HTMLInputElement).focus();
    } else if (event.key === "Escape") {
      toggleSearch();
      handleSearchChange("");
    }
  };

  const goToSelection = () => {
    if (!editor) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { results, resultIndex } = editor.storage.searchAndReplace;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const position = results[resultIndex];
    if (!position) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    editor.commands.setTextSelection(position);
    const { node } = editor.view.domAtPos(editor.state.selection.anchor);
    if (node instanceof Element) {
      node.scrollIntoView(false);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setMenuPosition({
      x: event.pageX,
      y: event.pageY,
    });
    setMenuVisible(true);
  };

  const hideMenu = () => {
    if (menuVisible) setMenuVisible(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        toggleSearch();
      }
      if (event.key === "Escape") {
        if (showSearch) setShowSearch(false);
        if (menuVisible) setMenuVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, [showSearch, menuVisible, toggleSearch]);

  return (
    <div
      className="relative h-full w-full cursor-text text-slate-400 overflow-y-auto"
      onClick={() => editor?.commands.focus()}
      style={{
        backgroundColor: "rgb(30, 30, 30)",
      }}
    >
      {showSearch && (
        <input
          type="text"
          value={searchTerm}
          onKeyDown={handleNextSearch}
          onChange={(event) => { handleSearchChange(event.target.value); }}
          onBlur={() => {
            setShowSearch(false);
            handleSearchChange("");
          }}
          placeholder="Search..."
          autoFocus
          className="absolute top-4 right-0 mt-4 mr-14 z-50 border-none rounded-md p-2 bg-transparent bg-dark-gray-c-ten text-white"
        />
      )}
      {menuVisible && (
        <EditorContextMenu
          editor={editor}
          menuPosition={menuPosition}
          setMenuVisible={setMenuVisible}
        />
      )}
      <EditorContent
        className="h-full overflow-y-auto"
        style={{
          wordBreak: "break-word",
          backgroundColor: "rgb(30, 30, 30)",
        }}
        onContextMenu={handleContextMenu}
        onClick={hideMenu}
        editor={editor}
      />
      {suggestionsState && (
        <InEditorBacklinkSuggestionsDisplay
          suggestionsState={suggestionsState}
          suggestions={flattenedFiles.map((file) => file.relativePath)}
        />
      )}
    </div>
  );
};

export default EditorManager;
