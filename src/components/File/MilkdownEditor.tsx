import { defaultValueCtx, Editor, rootCtx } from "@milkdown/core";
import { FC, useEffect, useState } from "react";

import { ReactEditor, useEditor } from "@milkdown/react";
import { commonmark } from "@milkdown/preset-commonmark";
import { nord } from "@milkdown/theme-nord";
import { gfm } from "@milkdown/preset-gfm";
import { menu } from "@milkdown/plugin-menu";

// import "@milkdown/theme-nord/style.css";
// import { MarkdownEditorProps } from "./MarkdownEditor";

export const MilkdownEditor: React.FC = () => {
  const { editor, loading, getInstance } = useEditor(
    (root) =>
      Editor.make()
        .use(nord)
        .use(commonmark)
        // .use(gfm)
        .use(menu)
        .config((ctx) => {
          ctx.set(rootCtx, root);
        })
    // .use(commonmark)
  );
  //   useEffect(() => {
  //     console.log("editor", get());
  //   }, [get]);
  //   const editor = get();
  //   console.log("editor", editor);
  //   editor?.ctx.set(defaultValueCtx, "Hello, Milkdown!");

  // useEffect(() => {
  //   if (!loading) {
  //     const editor = get();
  //     console.log("editor", editor);
  //     editor?.ctx.set(defaultValueCtx, "Hello, Milkdown!");
  //   }
  //   // const editor = get();
  //   // console.log("editor", editor);
  //   // editor?.ctx.set(defaultValueCtx, "Hello, Milkdown!");
  // }, [loading, get]);

  return <ReactEditor editor={editor} />;
};

export const MilkdownEditorWrapper: React.FC = () => {
  return (
    // <MilkdownProvider>
    <MilkdownEditor />
    // </MilkdownProvider>
  );
};
