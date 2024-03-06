import React, { useEffect } from "react";
import { Editor, rootCtx } from "@milkdown/core";
import { nord } from "@milkdown/theme-nord";
import { codeBlockSchema, commonmark, listItemSchema} from "@milkdown/preset-commonmark";
import debounce from "lodash.debounce";
import { history } from "@milkdown/plugin-history";
import { gfm } from "@milkdown/preset-gfm";
import { useEditor, Milkdown, MilkdownProvider } from "@milkdown/react";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { prism } from "@milkdown/plugin-prism";
import { block } from "@milkdown/plugin-block";
import { cursor } from "@milkdown/plugin-cursor";
import { clipboard } from "@milkdown/plugin-clipboard";
import { $view, replaceAll } from "@milkdown/utils";

import { BlockView } from './Block';

import { usePluginViewFactory, useNodeViewFactory, ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import { ListItem } from "./Todo/ListItem";
import { CodeBlock } from "./Codeblock";

export interface MarkdownEditorProps {
  filePath: string;
}

const MilkdownEditor: React.FC<MarkdownEditorProps> = ({
  filePath,
}) => {

  const saveFile = async (fileContent:string) => {
    await window.files.writeFile(filePath, fileContent);  
  };


  const pluginViewFactory = usePluginViewFactory();
  const nodeViewFactory = useNodeViewFactory();

  const { get } = useEditor((root) => {
    return Editor
      .make()
      .config(ctx => {
        ctx.set(rootCtx, root)
        // ctx.set(defaultValueCtx, lastSavedContentRef.current);
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          debounce(saveFile, 1000)(markdown);
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
      .use($view(listItemSchema.node, () =>
        nodeViewFactory({ component: ListItem })
      ))
      .use(
        $view(codeBlockSchema.node, () =>
          nodeViewFactory({ component: CodeBlock })
        )
      );
      // .use(slash)
  }, [])
  
  //initial file read and set content
  useEffect(() => {
    
    const fetchContent = async () => {
      try {
        const fileContent = await window.files.readFile(filePath);
        get()?.action(replaceAll(fileContent));
      } catch (error) {
        console.error("Error reading file:", error);
      }
    };

    console.log("fetching content for filepath: ", filePath)
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
}) => {
  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
        <MilkdownEditor filePath={filePath} />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  );
};

export default MilkdownEditorWrapper;
