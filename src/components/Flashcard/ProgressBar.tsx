import React from "react";

export interface ProgressBarProps {
  completed: number;
  total: number;
  height: string;
}

const ProgressBar = ({ completed, total, height }: ProgressBarProps) => {
  return (
    <div style={{ backgroundColor: "grey", borderRadius: 50 }}>
      <div
        style={{
          height: height,
          width: `${(completed / total) * 100}%`,
          backgroundColor: "#FFFDD0",
          borderRadius: "inherit",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "black",
            padding: "10px",
          }}
        >{`${completed}/${total}`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
