import "@mdxeditor/editor/style.css";
import React, { useEffect, useRef, useState } from "react";
import "./tiptap.scss";
import { EditorProps } from "./MdxEditor";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
// import { Markdown } from "tiptap-markdown";

// import "@toast-ui/editor/dist/toastui-editor.css";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// const extensions = [StarterKit];

const tiptapContent = "Hello World!";

export const TipTapEditor: React.FC<EditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
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

    content: tiptapContent,
  });
  // const ref = useRef(null);

  // useEffect(() => {
  //   console.log("content is: ", content);
  //   if (editor) {
  //     editor.commands.setContent(content);
  //   }
  // }, [editor, content]);

  // editor?

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await window.files.readFile(filePath);
        setContent(fileContent);
        // ref.current?.setMarkdown(fileContent);
        editor?.commands.setContent(content);

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
  }, [editor, filePath]);

  const saveFile = async () => {
    const htmlContent = editor?.getHTML();
    console.log("htmlContent is: ", htmlContent);
    // if (content !== lastSavedContentRef.current) {
    //   await window.files.writeFile({
    //     filePath: filePath,
    //     content: content,
    //   });
    //   lastSavedContentRef.current = content; // Update the ref to the latest saved content
    // }
  };

  useEffect(() => {
    const saveInterval = setInterval(() => {
      const htmlContent = editor?.getHTML();
      console.log("htmlContent is: ", htmlContent);
      // saveFile();
    }, 1000);

    return () => clearInterval(saveInterval); // Clear the interval when component unmounts
  }, [editor, content]); // Dependency on content ensures saveFile has the latest content

  useEffect(() => {
    setContentInParent(content);
  }, [content]);

  const handleDivClick = () => {
    // if (ref.current) {
    // ref.current.focus(); // Programmatically trigger a click on the MDXEditor
    // }
  };

  return (
    <div
      className="h-full overflow-y-auto w-full cursor-text bg-slate-800 "
      onClick={handleDivClick}
    >
      <EditorContent editor={editor} />
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </div>
  );
};

export default TipTapEditor;
