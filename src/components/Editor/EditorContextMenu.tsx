import React, { useEffect, useRef, useState } from "react";

import { EditorState, Transaction } from "@tiptap/pm/state";
import { Dispatch, Editor } from "@tiptap/react";
import { AiOutlineDelete } from "react-icons/ai";
import { CiViewTable } from "react-icons/ci";
import { FaRegCopy } from "react-icons/fa";
import { IoMdCut } from "react-icons/io";
import { MdContentPaste } from "react-icons/md";

import "../../styles/global.css";

interface MenuPosition {
  x: number;
  y: number;
}

interface EditorContextMenu {
  editor: Editor | null;
  menuPosition: MenuPosition;
  setMenuVisible: (visible: boolean) => void;
}
/**
 *
 * Options:
 * 	Cut
 * 	Copy
 * 	Paste
 * 	Paste without formatting
 * 	Delete
 * 	------------------------
 * 	Insert
 * 	Format
 *
 * @param editor
 * @returns Dropdown menu to perform actions on selected text
 *
 */
const EditorContextMenu: React.FC<EditorContextMenu> = ({
  editor,
  menuPosition,
  setMenuVisible,
}) => {
  if (!editor) return;
  const [showTableSelector, setShowTableSelector] = useState(false);
  /**
   * We use useRef instead of state's because we are changing the style of our DOM but DO NOT
   * want to re-render. This style gets applied once and does not change, so no re-render is needed.
   */
  const tableButtonRef = useRef<HTMLLIElement>(null);
  const tableSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfOutside = (event: MouseEvent) => {
      if (
        tableButtonRef.current &&
        tableSelectorRef.current &&
        !tableButtonRef.current.contains(event.target as Node) &&
        !tableSelectorRef.current.contains(event.target as Node)
      ) {
        setShowTableSelector(false);
      }
    };

    document.addEventListener("mouseover", checkIfOutside);

    return () => {
      document.removeEventListener("mouseover", checkIfOutside);
    };
  }, []);

  const handleTableSelect = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: rows, cols: cols, withHeaderRow: true })
      .run();
    setShowTableSelector(false); // Hide selector after selection
    setMenuVisible(false);
  };

  const isTextCurrentlySelected = () => {
    return !editor.state.selection.empty;
  };

  // If text is not selected, then do not perform action.
  const handleCommand = (command: string) => {
    if (!isTextCurrentlySelected()) return;

    switch (command) {
      case "cut":
        cutCommand(editor.state, (tr: Transaction) => {
          editor.view.dispatch(tr);
        });
        break;
      case "copy":
        copyCommand(editor.state);
        break;
      case "delete":
        deleteCommand(editor.state, (tr: Transaction) => {
          editor.view.dispatch(tr);
        });
        break;
      default:
        break;
    }

    setMenuVisible(false);
  };

  return (
    <div>
      <ul
        className="bubble-menu"
        style={{
          position: "absolute",
          top: `${menuPosition.y - 30}px`,
          left: `${menuPosition.x - 190}px`,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          borderRadius: "4px",
        }}
      >
        <li
          onClick={() => {
            handleCommand("copy");
          }}
          className={`bubble-menu-item ${
            !isTextCurrentlySelected() ? "disabled opacity-50" : ""
          }`}
        >
          <FaRegCopy className="icon" />
          <span className="text">Copy</span>
        </li>
        <li
          onClick={() => {
            handleCommand("cut");
          }}
          className={`bubble-menu-item ${
            !isTextCurrentlySelected() ? "disabled opacity-50" : ""
          }`}
        >
          <IoMdCut className="icon" />
          <span className="text">Cut</span>
        </li>
        <li
          onClick={() => {
            pasteCommand(editor);
            setMenuVisible(false);
          }}
          className={`bubble-menu-item`}
        >
          <MdContentPaste className="icon" />
          <span className="text">Paste</span>
        </li>
        <li
          onClick={() => {
            handleCommand("delete");
          }}
          className={`bubble-menu-item ${
            !isTextCurrentlySelected() ? "disabled opacity-50" : ""
          }`}
        >
          <AiOutlineDelete className="icon" />
          <span className="text">Delete</span>
        </li>
        <div className="w-full h-px bg-gray-500"></div>
        <li
          ref={tableButtonRef}
          onMouseEnter={() => {
            setShowTableSelector(true);
          }}
          className={`bubble-menu-item`}
        >
          <CiViewTable className="icon" />
          <span className="text">Table</span>
        </li>
      </ul>
      {showTableSelector && (
        <div
          ref={tableSelectorRef}
          style={{
            position: "absolute",
            top: `${menuPosition.y + 120}px`,
            left: `${menuPosition.x}px`,
            zIndex: 1002,
          }}
        >
          <TableSizeSelector onSelect={handleTableSelect} />
        </div>
      )}
    </div>
  );
};

/**
 * Table that is displayed when hovering over table in contextMenu
 *
 * @param param onSelect: callback function that provides row and cols that user selected
 *
 * @returns number of rows and cols selected
 */
interface TableSizeSelectorProps {
  onSelect: (rows: number, cols: number) => void;
}

/**
 *
 * Copies text that is selected
 */
const copyCommand = (state: EditorState) => {
  if (state.selection.empty) return false;

  const { from, to } = state.selection;
  const text = state.doc.textBetween(from, to, "");

  navigator.clipboard.writeText(text);
  return true;
};

const TableSizeSelector: React.FC<TableSizeSelectorProps> = ({ onSelect }) => {
  const maxRows = 10;
  const maxCols = 10;
  const [hoveredRows, setHoveredRows] = useState(0);
  const [hoveredCols, setHoveredCols] = useState(0);

  const generateCells = () => {
    const rows = [];
    for (let i = 1; i <= maxRows; i++) {
      const cols = [];
      for (let j = 1; j <= maxCols; j++) {
        cols.push(
          <div
            key={j}
            className={`cell ${
              i <= hoveredRows && j <= hoveredCols ? "hovered" : ""
            }`}
            onMouseEnter={() => {
              setHoveredRows(i);
              setHoveredCols(j);
            }}
            onClick={() => {
              onSelect(i, j);
            }}
          />
        );
      }
      rows.push(
        <div key={i} className="row">
          {cols}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="table-size-selector flex flex-col justify-center items-center">
      {generateCells()}
      <div className="flex justify-center w-full pt-2">
        <div className="text-white">
          {hoveredRows} x {hoveredCols}
        </div>
      </div>
    </div>
  );
};

/**
 *
 * Cuts text that is selected
 */
const cutCommand = (state: EditorState, dispatch: Dispatch | null) => {
  if (state.selection.empty) return false;

  copyCommand(state);

  // Remove text from the document
  if (dispatch) dispatch(state.tr.deleteSelection().scrollIntoView());

  return true;
};

/**
 *
 * Pastes text that currently exists in clipboard
 */
const pasteCommand = async (editor: Editor) => {
    try {
      const text = await navigator.clipboard.readText();
      editor.commands.insertContent(text);
    } catch (err) {
      console.error(`Failed to read from clipboard:`, err);
    }
};

/**
 * Deletes the text that is selected.
 */
const deleteCommand = (state: EditorState, dispatch: Dispatch | null) => {
  const transaction = state.tr.deleteSelection();

  if (dispatch) {
    dispatch(transaction);
  }

  return true;
};

export default EditorContextMenu;
