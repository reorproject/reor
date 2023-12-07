import { defaultValueCtx, Editor, rootCtx } from "@milkdown/core";
import { FC, useEffect, useState } from "react";

import { Milkdown, useEditor, MilkdownProvider } from "@milkdown/react";
import { commonmark } from "@milkdown/preset-commonmark";
import { nord } from "@milkdown/theme-nord";

import "@milkdown/theme-nord/style.css";
import { MarkdownEditorProps } from "./MarkdownEditor";

export const MilkdownEditor: React.FC = () => {
  const { get } = useEditor((root) =>
    Editor.make()
      .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
      })
      .use(commonmark)
  );

  return <Milkdown />;
};

export const MilkdownEditorWrapper: React.FC<MarkdownEditorProps> = () => {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
};
