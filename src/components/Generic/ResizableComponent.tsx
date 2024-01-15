import React, { useState, useCallback, useEffect, CSSProperties } from "react";

interface ResizableComponentProps {
  children: React.ReactNode;
  initialWidth?: number;
  resizeSide: "left" | "right" | "both";
}

const ResizableComponent: React.FC<ResizableComponentProps> = ({
  children,
  initialWidth = 200, // Default value if not provided
  resizeSide,
}) => {
  const [width, setWidth] = useState<number>(initialWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startDragging = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        // Adjust width based on the drag side
        const deltaWidth = resizeSide === "left" ? -e.movementX : e.movementX;
        setWidth((prevWidth) => prevWidth + deltaWidth);
      }
    },
    [isDragging, resizeSide]
  );

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", stopDragging);
      return () => {
        window.removeEventListener("mousemove", onDrag);
        window.removeEventListener("mouseup", stopDragging);
      };
    }
  }, [isDragging, onDrag, stopDragging]);

  const getResizeHandleStyle = (): CSSProperties => {
    return {
      width: "5px",
      cursor: "ew-resize",
      position: "absolute",
      top: 0,
      bottom: 0,
      ...(resizeSide === "left" && { left: 0 }),
      ...(resizeSide === "right" && { right: 0 }),
      ...(resizeSide === "both" && { left: 0, right: 0 }),
    };
  };

  const resizeHandleStyle = getResizeHandleStyle();

  return (
    <div
      style={{
        width: `${width}px`,
        resize: "none",
        overflow: "auto",
        position: "relative",
        height: "100%",
      }}
      onMouseDown={resizeSide === "both" ? startDragging : undefined}
    >
      <div style={{ width: "100%", height: "100%" }}>{children}</div>
      {resizeSide !== "both" && (
        <div style={resizeHandleStyle} onMouseDown={startDragging} />
      )}
    </div>
  );
};

export default ResizableComponent;
