import React, { useEffect, useState } from "react";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { nord } from "@milkdown/theme-nord";
import { commonmark } from "@milkdown/preset-commonmark";
import { history } from "@milkdown/plugin-history";
import { gfm } from "@milkdown/preset-gfm";
import { ReactEditor, useEditor } from "@milkdown/react";
import "./milkdown.css";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { prism } from "@milkdown/plugin-prism";
import { block } from "@milkdown/plugin-block";
// import slash from "./slash"; // Uncomment if slash is used
import { cursor } from "@milkdown/plugin-cursor";
import { clipboard } from "@milkdown/plugin-clipboard";
import { replaceAll } from "@milkdown/utils";
// import { slash } from "@milkdown/plugin-slash";

export interface MarkdownEditorProps {
  filePath: string;
  // content: string;
  setContentInParent: (content: string) => void;
  lastSavedContentRef: React.MutableRefObject<string>;
}

const MilkdownEditor: React.FC<MarkdownEditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
  // content,
  // setContent,
}) => {
  const [content, setContent] = useState<string>("");

  // const ref = useRef<MDXEditorMethods>(null);
  // const lastSavedContentRef = useRef<string>("");

  const saveFile = async () => {
    if (content !== lastSavedContentRef.current) {
      // Check for changes since last save
      console.log("calling save file:");
      await window.files.writeFile(filePath, content);
      lastSavedContentRef.current = content; // Update the ref to the latest saved content
    }
  };

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveFile();
    }, 1000); // Every 1 second

    return () => clearInterval(saveInterval); // Clear the interval when component unmounts
  }, [content]); // Dependency on content ensures saveFile has the latest content

  useEffect(() => {
    // console.log("content set to: ")
    setContentInParent(content);
  }, [content]);

  const { editor, getInstance } = useEditor(
    (root) =>
      Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, content);
          ctx
            .get(listenerCtx)

            .markdownUpdated((ctx, markdown) => {
              setContent(markdown);
            });
        })

        .use(nord)
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(listener)
        .use(prism)
        // .use(menu)
        .use(block)
        .use(cursor)
        .use(clipboard)
    // .use(slash)
  );

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await window.files.readFile(filePath);
        // setContent(fileContent);
        getInstance()?.action(replaceAll(fileContent));
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

  return (
    <div
      className="h-full overflow-auto"
      // className="font-material-icons"
      style={
        {
          // fontFamily: "Material Icons",
        }
      }
    >
      <ReactEditor editor={editor} />
    </div>
  );
};

export default MilkdownEditor;
