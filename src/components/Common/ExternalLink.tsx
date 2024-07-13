import React from "react";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode; // Now using children prop for link text
}

// Open link in browser:
const ExternalLink: React.FC<ExternalLinkProps> = ({ href: url, children }) => {
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    window.electronUtils.openExternal(url);
  };

  return (
    <a href={url} onClick={handleLinkClick} className="text-blue-300">
      {children}
    </a>
  );
};

export default ExternalLink;
