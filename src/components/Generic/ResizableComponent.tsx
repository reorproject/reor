import React, { useState, useCallback, useEffect } from "react";

interface ResizableComponentProps {
  children: React.ReactNode;
}

const ResizableComponent: React.FC<ResizableComponentProps> = ({
  children,
}) => {
  const [width, setWidth] = useState<number>(200);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startDragging = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        setWidth((prevWidth) => prevWidth + e.movementX);
      }
    },
    [isDragging]
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

  return (
    <div
      style={{
        width: `${width}px`,
        resize: "horizontal",
        overflow: "auto",
        position: "relative",
      }}
      onMouseDown={startDragging}
    >
      <div style={{ width: "100%", height: "100%" }}>{children}</div>
      <div
        style={{
          width: "10px",
          cursor: "ew-resize",
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
    </div>
  );
};

export default ResizableComponent;
