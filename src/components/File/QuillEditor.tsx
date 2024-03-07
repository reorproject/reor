import "@mdxeditor/editor/style.css";
import React, { useEffect, useRef, useState } from "react";
import "./tiptap.scss";
import { EditorProps } from "./MdxEditor";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// import "@toast-ui/editor/dist/toastui-editor.css";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
const extensions = [StarterKit];

const tiptapContent = "Hello World!";

export const QuillEditor: React.FC<EditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
  const [content, setContent] = useState<string>("");
  const ref = useRef(null);
  const editor = useEditor({
    extensions,
    content: tiptapContent,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await window.files.readFile(filePath);
        setContent(fileContent);
        // ref.current?.setMarkdown(fileContent);
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
  }, [content]); // Dependency on content ensures saveFile has the latest content

  useEffect(() => {
    setContentInParent(content);
  }, [content]);

  const handleDivClick = () => {
    if (ref.current) {
      // ref.current.focus(); // Programmatically trigger a click on the MDXEditor
    }
  };

  return (
    <div
      className="h-full overflow-y-auto w-full cursor-text bg-slate-800 "
      onClick={handleDivClick}
    >
      <ReactQuill theme="snow" value={content} onChange={setContent} />{" "}
      {/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
    </div>
  );
};

export default QuillEditor;
