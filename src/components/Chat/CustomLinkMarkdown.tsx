import React from "react";
interface CustomLinkMarkdownProps {
  openFileByPath: (path: string) => void;
  props: object;
}
export const CustomLinkMarkdown = ({
  openFileByPath,
  props,
}: CustomLinkMarkdownProps) => {
  const handleCustomLinkClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default link behavior
    const link = (event.target as HTMLAnchorElement).innerText;
    openFileByPath(link);
  };
  return <a {...props} onClick={handleCustomLinkClick} />;
};
