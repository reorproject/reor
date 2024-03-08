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

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const turndownService = new TurndownService();

export const TipTapEditor: React.FC<EditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
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
    },
  });

  useEffect(() => {
    const fetchContent = async (filePath: string, editor: Editor) => {
      try {
        const fileContent = await window.files.readFile(filePath);
        const htmlContent = marked.parse(fileContent);

        editor?.commands.setContent(htmlContent);

        lastSavedContentRef.current = fileContent; // Initialize with fetched content
      } catch (error) {
        console.error("Error reading file:", error);
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
    <div className="h-full overflow-y-auto w-full cursor-text bg-slate-800 ">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
