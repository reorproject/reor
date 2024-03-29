import { removeFileExtension } from "@/functions/strings";
import React, { useState, useRef, useEffect } from "react";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";

interface FileHistoryNavigatorProps {
  onFileSelect: (path: string) => void;
  currentPath: string;
}

const FileHistoryNavigator: React.FC<FileHistoryNavigatorProps> = ({
  onFileSelect,
  currentPath,
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const buttonRefBack = useRef<HTMLButtonElement>(null);
  const buttonRefForward = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    currentPath !== "" &&
      currentPath !== history[currentIndex] &&
      handleFileSelect(currentPath);
  }, [currentPath]);

  useEffect(() => {
    console.log(`currentIndex: ${currentIndex}`, { history });
  }, [currentIndex]);

  const handleFileSelect = (path: string) => {
    const updatedHistory = [...history.slice(0, currentIndex + 1), path];
    setHistory(updatedHistory);
    setCurrentIndex(updatedHistory.length - 1);
  };

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < history.length - 1;

  const goBack = () => {
    if (canGoBack && showMenu === "") {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onFileSelect(history[newIndex]);
    }
  };

  const goForward = () => {
    if (canGoForward && showMenu === "") {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onFileSelect(history[newIndex]);
    }
  };

  const goIndex = (newIndex: number): void => {
    if (newIndex > -1) {
      setCurrentIndex(newIndex);
      onFileSelect(history[newIndex]);
    }
    setShowMenu('');
  };

  const handleLongPressStart = (direction: "back" | "forward") => {
    longPressTimer.current = setTimeout(() => {
      console.log(`${direction} holded 1 seconds.`);
      setShowMenu(direction);
    }, 1000); // 1 seconds
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowMenu("");
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleHistoryContext = (
    currentRef: React.RefObject<HTMLButtonElement>
  ) => {
    const offsetTop = currentRef.current?.offsetTop || 0;
    const offsetLeft = currentRef.current?.offsetLeft || 0;
    const offsetHeight = currentRef.current?.offsetHeight || 0;

    const menuChild =
      currentRef.current?.id === "back"
        ? history.slice(0, currentIndex)
        : history.slice(currentIndex + 1);

    const startInd = currentRef.current?.id === "back" ? 0 : currentIndex + 1;

    return (
      showMenu !== "" && menuChild.length > 0 && (
        <div
          ref={ref}
          tabIndex={0}
          style={{
            position: "absolute",
            left: `${offsetLeft}px`,
            top: `${offsetTop + offsetHeight}px`,
            backgroundColor: "#f9f9f9",
            boxShadow: "0px 8px 16px rgba(0,0,0,0.2)",
            padding: "6px 8px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
        >
          <ul style={{ listStyleType: "none", padding: "0", margin: "0" }}>
            {menuChild.map((path, ind) => (
              <li
                key={ind + startInd}
                style={{ padding: "4px 2px", cursor: "pointer" }}
              >
                <div
                  key={ind + startInd}
                  onClick={() => goIndex(ind + startInd)}
                  style={{ color: "#666666", fontSize: "11px" }}
                >
                  {removeFileExtension(
                    path.replace(/\\/g, "/").split("/").pop() || ""
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )
    );
  };

  return (
    <div
      style={{
        padding: "1px",
        backgroundColor: "#272626",
        margin: "2px 0px",
        overflow: "hidden",
        border: "1px solid #212020",
        borderRadius: "3px",
      }}
    >
      <button
        id="back"
        ref={buttonRefBack}
        onMouseDown={() => handleLongPressStart("back")}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={goBack}
        disabled={!canGoBack}
        style={{
          background: "none",
          color: !canGoBack ? "#727272" : "#dedede",
          fontSize: "20px",
          border: "none",
          cursor: !canGoBack ? "default" : "pointer",
        }}
        title="Back"
      >
        <FaCircleChevronLeft title="Back" />
      </button>
      <button
        id="forward"
        ref={buttonRefForward}
        onMouseDown={() => handleLongPressStart("forward")}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={goForward}
        disabled={!canGoForward}
        style={{
          background: "none",
          color: !canGoForward ? "#727272" : "#dedede",
          fontSize: "20px",
          border: "none",
          paddingLeft: "4px",
          cursor: !canGoForward ? "default" : "pointer",
        }}
        title="Forward"
      >
        <FaCircleChevronRight title="Forward" />
      </button>
      {handleHistoryContext(
        showMenu === "back" ? buttonRefBack : buttonRefForward
      )}
    </div>
  );
};

export default FileHistoryNavigator;
