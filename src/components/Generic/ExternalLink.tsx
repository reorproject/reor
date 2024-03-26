import React from "react";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode; // Now using children prop for link text
}

// Open link in browser:
const ExternalLink: React.FC<ExternalLinkProps> = ({ href: url, children }) => {
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    // Assuming `window.electron.openExternal` is the correct method
    // to open the link in the external browser. Ensure this is implemented
    // in your Electron app's preload script if `nodeIntegration` is set to false.
    window.electron.openExternal(url);
  };

  return (
    <a href={url} onClick={handleLinkClick} className="text-blue-300">
      {children}
    </a>
  );
};

export default ExternalLink;
