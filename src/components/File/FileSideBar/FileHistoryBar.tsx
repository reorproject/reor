import { removeFileExtension } from "@/functions/strings";
import React, { useState, useRef, useEffect } from "react";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import "./../../../styles/history.scss";

interface FileHistoryNavigatorProps {
  history: string[];
  setHistory: (string: string[]) => void;
  onFileSelect: (path: string) => void;
  currentPath: string;
}

const FileHistoryNavigator: React.FC<FileHistoryNavigatorProps> = ({
  history,
  setHistory,
  onFileSelect,
  currentPath,
}) => {
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
    const updatedHistory = [
      ...history.filter((val) => val !== path).slice(0, currentIndex + 1),
      path,
    ];
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

  const goSelected = (path: string): void => {
    if (path) {
      const newIndex = history.indexOf(path);
      setCurrentIndex(newIndex);
      onFileSelect(path);
    }
    setShowMenu("");
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

    return (
      showMenu !== "" &&
      menuChild.length > 0 && (
        <div
          ref={ref}
          className="history-menu"
          tabIndex={0}
          style={{
            left: `${offsetLeft}px`,
            top: `${offsetTop + offsetHeight}px`,
          }}
        >
          <ul>
            {menuChild.map((path, ind) => (
              <li key={ind}>
                <div key={ind} onClick={() => goSelected(path)}>
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
    <div className="history-container">
      <button
        id="back"
        ref={buttonRefBack}
        onMouseDown={() => handleLongPressStart("back")}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onClick={goBack}
        disabled={!canGoBack}
        style={{
          color: !canGoBack ? "#727272" : "#dedede",
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
          color: !canGoForward ? "#727272" : "#dedede",
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
