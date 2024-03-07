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
import { marked } from "marked";

// import { Markdown } from "tiptap-markdown";

// import "@toast-ui/editor/dist/toastui-editor.css";
const turndownService = new TurndownService();
turndownService.addRule("paragraph", {
  filter: "p",
  replacement: (content) => `\n\n${content}\n\n`, // Adjust replacement as needed
});

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// const extensions = [StarterKit];

// const tiptapContent = "Hello World!";

export const TipTapEditor: React.FC<EditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
  // const [content, setContent] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string>("");
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
          setMarkdownContent(markdown);
        }
      }
      // send the content to an API here
    },

    // content: tiptapContent,
  });

  useEffect(() => {
    // setContentInParent(content);
    console.log("content is: ", markdownContent);
  }, [markdownContent]);

  useEffect(() => {
    const fetchContent = async (filePath: string, editor: Editor) => {
      try {
        const fileContent = await window.files.readFile(filePath);
        const htmlContent = marked.parse(fileContent);

        editor?.commands.setContent(htmlContent);

        lastSavedContentRef.current = fileContent; // Initialize with fetched content
      } catch (error) {
        // Handle the error here
        console.error("Error reading file:", error);
        // Optionally, you can set some state to show an error message in the UI
      }
    };

    if (filePath && editor) {
      fetchContent(filePath, editor);
    }
  }, [filePath, editor]);

  const saveFile = async () => {
    if (markdownContent !== lastSavedContentRef.current) {
      await window.files.writeFile({
        filePath: filePath,
        content: markdownContent,
      });
      lastSavedContentRef.current = markdownContent; // Update the ref to the latest saved content
    }
  };

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveFile();
    }, 1000);

    return () => clearInterval(saveInterval); // Clear the interval when component unmounts
  }, [markdownContent]);

  useEffect(() => {
    setContentInParent(markdownContent);
  }, [markdownContent]);

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
