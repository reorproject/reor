import React from "react";

interface ExternalLinkProps {
  url: string;
  label: string;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({ url, label }) => {
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault(); // Prevent the default anchor action
    window.electron.openExternal(url);
  };

  return (
    <a href={url} onClick={handleLinkClick} className="text-blue-300">
      {label}
    </a>
  );
};

export default ExternalLink;
