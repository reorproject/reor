import "@mdxeditor/editor/style.css";
import React, { useEffect, useState } from "react";
import "./tiptap.scss";
import { EditorProps } from "./MdxEditor";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import TurndownService from "turndown";

// import { Markdown } from "tiptap-markdown";

// import "@toast-ui/editor/dist/toastui-editor.css";
const turndownService = new TurndownService();
turndownService.addRule("paragraph", {
  filter: "p",
  replacement: (content) => `\n\n${content}\n\n`, // Adjust replacement as needed
});

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// const extensions = [StarterKit];

// const tiptapContent = "Hello World!";

export const TipTapEditor: React.FC<EditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
  // const [content, setContent] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    onUpdate: ({ editor }) => {
      const htmlContent = editor?.getHTML();
      console.log("htmlContent is: ", htmlContent);
      // saveFile();
      if (htmlContent) {
        const markdown = turndownService.turndown(htmlContent);
        console.log("markdown is: ", markdown);
        if (markdown !== lastSavedContentRef.current) {
          // setContentInParent(markdown);
          setContent(markdown);
        }
      }
      // send the content to an API here
    },

    // content: tiptapContent,
  });

  useEffect(() => {
    // setContentInParent(content);
    console.log("content is: ", content);
  }, [content]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await window.files.readFile(filePath);
        setContent(fileContent);
        editor?.commands.setContent(fileContent);
        lastSavedContentRef.current = fileContent; // Initialize with fetched content
      } catch (error) {
        // Handle the error here
        console.error("Error reading file:", error);
        // Optionally, you can set some state to show an error message in the UI
      }
    };

    if (filePath) {
      fetchContent();
    }
  }, [filePath]);

  const saveFile = async () => {
    if (content !== lastSavedContentRef.current) {
      await window.files.writeFile({
        filePath: filePath,
        content: content,
      });
      lastSavedContentRef.current = content; // Update the ref to the latest saved content
    }
  };

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveFile();
    }, 1000);

    return () => clearInterval(saveInterval); // Clear the interval when component unmounts
  }, [content]);

  useEffect(() => {
    setContentInParent(content);
  }, [content]);

  return (
    <div
      className="h-full overflow-y-auto w-full cursor-text bg-slate-800 "
      // onClick={handleDivClick}
    >
      <EditorContent editor={editor} />
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </div>
  );
};

export default TipTapEditor;
