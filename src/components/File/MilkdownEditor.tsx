import React, { useEffect, useState } from "react";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { nord } from "@milkdown/theme-nord";
import { commonmark } from "@milkdown/preset-commonmark";
import { history } from "@milkdown/plugin-history";
import { gfm } from "@milkdown/preset-gfm";
import { useEditor, Milkdown, MilkdownProvider } from "@milkdown/react";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { prism } from "@milkdown/plugin-prism";
import { block } from "@milkdown/plugin-block";
import { cursor } from "@milkdown/plugin-cursor";
import { clipboard } from "@milkdown/plugin-clipboard";
import { replaceAll } from "@milkdown/utils";

import { BlockView } from './Block';

import { usePluginViewFactory, ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';

export interface MarkdownEditorProps {
  filePath: string;
  setContentInParent: (content: string) => void;
  lastSavedContentRef: React.MutableRefObject<string>;
}

const MilkdownEditor: React.FC<MarkdownEditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
  const [content, setContent] = useState<string>("");

  const saveFile = async () => {
    if (content !== lastSavedContentRef.current) {
      await window.files.writeFile(filePath, content);
      lastSavedContentRef.current = content;
    }
  };

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveFile();
    }, 1000);

    return () => clearInterval(saveInterval);
  }, [content]);

  useEffect(() => {
    setContentInParent(content);
  }, [content]);

  const pluginViewFactory = usePluginViewFactory();

  const { get } = useEditor((root) => {
    return Editor
      .make()
      .config(ctx => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, content);
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
          setContent(markdown)
        })
        ctx.set(block.key, {
          view: pluginViewFactory({
          component: BlockView,
          })
        })
      })
      .config(nord)
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
  }, [])
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await window.files.readFile(filePath);
        get()?.action(replaceAll(fileContent));
        lastSavedContentRef.current = fileContent;
      } catch (error) {
        console.error("Error reading file:", error);
      }
    };

    if (filePath) {
      fetchContent();
    }
  }, [filePath]);

  return (
    <div className="h-full overflow-auto">
        <Milkdown />
    </div>
  );
};

const MilkdownEditorWrapper: React.FC<MarkdownEditorProps> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
        <MilkdownEditor filePath={filePath} setContentInParent={setContentInParent} lastSavedContentRef={lastSavedContentRef} />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  );
};

export default MilkdownEditorWrapper;
