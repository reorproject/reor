import React, { useEffect, useState } from "react";
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  editorViewCtx,
  Ctx,
  schemaCtx,
} from "@milkdown/core";
import { nord } from "@milkdown/theme-nord";
import { commonmark } from "@milkdown/preset-commonmark";
import { history } from "@milkdown/plugin-history";
import { gfm } from "@milkdown/preset-gfm";
import { ReactEditor, useEditor } from "@milkdown/react";
import {
  tooltip,
  tooltipPlugin,
  createToggleIcon,
  defaultButtons,
} from "@milkdown/plugin-tooltip";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { prism } from "@milkdown/plugin-prism";
import { menu } from "@milkdown/plugin-menu";
import { block } from "@milkdown/plugin-block";
// import slash from "./slash"; // Uncomment if slash is used
import { cursor } from "@milkdown/plugin-cursor";
import { clipboard } from "@milkdown/plugin-clipboard";
import { insert, replaceAll, getMarkdown } from "@milkdown/utils";

export interface MarkdownEditorProps {
  filePath: string;
  // content: string;
  setContentInParent: (content: string) => void;
  lastSavedContentRef: React.MutableRefObject<string>;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
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
    }, 5000); // Every 10 seconds

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
            .beforeMount((ctx) => {
              console.log("beforeMount");
            })
            .mounted((ctx) => {
              console.log("mounted");
              insert("# Default Title");
            })
            .updated((ctx, doc, prevDoc) => {
              console.log("updated", doc, prevDoc);
              console.log("updated JSON", doc.toJSON());
            })
            .markdownUpdated((ctx, markdown, prevMarkdown) => {
              console.log(
                "markdownUpdated to=",
                markdown,
                "\nprev=",
                prevMarkdown
              );
              setContent(markdown);
            })
            .blur((ctx) => {
              console.log("when editor loses focus");
            })
            .focus((ctx) => {
              const view = ctx.get(editorViewCtx);
              console.log("focus", view);
            })
            .destroy((ctx) => {
              console.log("destroy");
            });
        })
        .use(
          tooltip.configure(tooltipPlugin, {
            bottom: true,
            items: (ctx: Ctx) => {
              const marks = ctx.get(schemaCtx).marks;
              const nodes = ctx.get(schemaCtx).nodes;
              return [
                createToggleIcon("bold", "OK", marks.strong, marks.code_inline),
              ];
            },
          })
        )
        .use(nord)
        .use(commonmark)
        // .use(gfm)
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
    <div className="h-full">
      {" "}
      <ReactEditor editor={editor} />
    </div>
  );
};

export default MarkdownEditor;
