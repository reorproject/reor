import "@mdxeditor/editor/style.css";
import React, { useEffect /**editor */ } from "react";
import "./tiptap.scss";
// import { EditorProps } from "./MdxEditor";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
// import TurndownService from "turndown";
// import { marked } from "marked";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import debounce from "lodash.debounce";

// const turndownService = new TurndownService();
interface EditorProps {
  // fileContent: string;
  // setFileContent: (content: string) => void;
  setEditor: (editor: Editor | null) => void;
}

export const TipTapEditor: React.FC<EditorProps> = ({ setEditor }) => {
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
    // content: fileContent, // modify this to be in HTML format

    // onUpdate: ({ editor }) => {
    //   const htmlContent = editor?.getHTML();
    //   if (htmlContent) {
    //     const markdown = turndownService.turndown(htmlContent);
    //     console.log("markdown is: ", markdown);
    //     debounce(setFileContent, 1000)(markdown);
    //   }
    // },
  });

  useEffect(() => {
    setEditor(editor);
  }, [editor]);

  return (
    <div className="h-full overflow-y-auto w-full cursor-text bg-slate-800 ">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
