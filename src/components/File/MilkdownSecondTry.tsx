import React, { useEffect, useState } from "react";
// import "./styles.css";
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

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
  const [content, setContent] = useState<string>(
    "# hello \nSelect me to annotate me!"
  );
  useEffect(() => {
    console.log("content in parent=", content);
    setContentInParent(content);
  }, [content]);
  return (
    <div className="bg-red-100">
      <Milkdown2 content={content} setContent={setContent} />
      <hr />
    </div>
  );
};

export interface MilkdownEditorProps {
  //   filePath: string;
  // content: string;
  //   setContentInParent: (content: string) => void;
  //   lastSavedContentRef: React.MutableRefObject<string>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

const Milkdown2: React.FC<MilkdownEditorProps> = ({
  //   filePath,
  //   setContentInParent,
  //   lastSavedContentRef,
  content,
  setContent,
}) => {
  //   const [content, setContent] = useState<string>(
  //     "# hello \nSelect me to annotate me!"
  //   );

  useEffect(() => {
    console.log("content=", content);
    // setContentInParent(content);
  }, [content]);

  const { editor, getInstance } = useEditor(
    (root: HTMLElement) =>
      Editor.make()
        .config((ctx: Ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, content);
          ctx
            .get(listenerCtx)
            .beforeMount((ctx: Ctx) => {
              console.log("beforeMount");
            })
            .mounted((ctx: Ctx) => {
              console.log("mounted");
              insert("# Default Title");
            })
            .updated((ctx: Ctx, doc: any, prevDoc: any) => {
              console.log("updated", doc, prevDoc);
              console.log("updated JSON", doc.toJSON());
            })
            .markdownUpdated(
              (ctx: Ctx, markdown: string, prevMarkdown: string | null) => {
                console.log(
                  "markdownUpdated to=",
                  markdown,
                  "\nprev=",
                  prevMarkdown
                );
                setContent(markdown);
              }
            )
            .blur((ctx: Ctx) => {
              console.log("when editor loses focus");
            })
            .focus((ctx: Ctx) => {
              const view = ctx.get(editorViewCtx);
              console.log("focus", view);
            })
            .destroy((ctx: Ctx) => {
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
                createToggleIcon(
                  "bold",
                  "ok", //   (ctx: Ctx) => () => console.log("OK"),
                  marks.strong,
                  marks.code_inline
                ),
              ];
            },
          })
        )
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
    // .use(slash) // Uncomment if slash is used
  );

  const setValue = () => {
    console.log(getInstance()?.action(replaceAll("# Fetched \nMarkup")));
  };

  return (
    <div className="bg-red-100">
      <ReactEditor editor={editor} />
    </div>
  );
};

export default Milkdown2;
