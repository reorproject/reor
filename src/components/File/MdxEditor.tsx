import "@mdxeditor/editor/style.css";
import React, { useEffect, useRef, useState } from "react";

import {
  AdmonitionDirectiveDescriptor,
  DirectiveDescriptor,
  MDXEditor,
  MDXEditorMethods,
  SandpackConfig,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  sandpackPlugin,
  tablePlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import { LeafDirective } from "mdast-util-directive";

// UNUSED RIGHT NOW. IN FAVOUR OF MILKDOWN.
export interface MdxEditor {
  filePath: string;
  setContentInParent: (content: string) => void;
  lastSavedContentRef: React.MutableRefObject<string>;
}

export const MdxEditor: React.FC<MdxEditor> = ({
  filePath,
  setContentInParent,
  lastSavedContentRef,
}) => {
  const [content, setContent] = useState<string>("");
  const ref = useRef<MDXEditorMethods>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const fileContent = await window.files.readFile(filePath);
        setContent(fileContent);
        ref.current?.setMarkdown(fileContent);
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
      ref.current.focus(); // Programmatically trigger a click on the MDXEditor
    }
  };

  return (
    <div
      className="h-full overflow-y-auto w-full cursor-text bg-slate-800 "
      onClick={handleDivClick}
    >
      <MDXEditor
        ref={ref}
        className="dark-theme dark-editor"
        onChange={setContent}
        markdown={content}
        suppressHtmlProcessing={true}
        onError={(error) => console.log("error", error)}
        plugins={ALL_PLUGINS}
      />
    </div>
  );
};

interface YoutubeDirectiveNode extends LeafDirective {
  name: "youtube";
  attributes: { id: string };
}

export const YoutubeDirectiveDescriptor: DirectiveDescriptor<YoutubeDirectiveNode> =
  {
    name: "youtube",
    type: "leafDirective",
    testNode(node) {
      return node.name === "youtube";
    },
    attributes: ["id"],
    hasChildren: false,
    Editor: ({ mdastNode, lexicalNode, parentEditor }) => {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <button
            onClick={() => {
              parentEditor.update(() => {
                lexicalNode.selectNext();
                lexicalNode.remove();
              });
            }}
          >
            delete
          </button>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${mdastNode.attributes?.id}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      );
    },
  };

const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim();

export const virtuosoSampleSandpackConfig: SandpackConfig = {
  defaultPreset: "react",
  presets: [
    {
      label: "React",
      name: "react",
      meta: "live react",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
      initialSnippetContent: defaultSnippetContent,
    },
    {
      label: "React",
      name: "react",
      meta: "live",
      sandpackTemplate: "react",
      sandpackTheme: "light",
      snippetFileName: "/App.js",
      snippetLanguage: "jsx",
      initialSnippetContent: defaultSnippetContent,
    },
    {
      label: "Virtuoso",
      name: "virtuoso",
      meta: "live virtuoso",
      sandpackTemplate: "react-ts",
      sandpackTheme: "light",
      snippetFileName: "/App.tsx",
      initialSnippetContent: defaultSnippetContent,
      dependencies: {
        "react-virtuoso": "latest",
        "@ngneat/falso": "latest",
      },
      // files: {
      //   "/data.ts": dataCode,
      // },
    },
  ],
};

export const ALL_PLUGINS = [
  // toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
  linkPlugin(),
  // linkDialogPlugin(),
  imagePlugin({
    imageAutocompleteSuggestions: [
      "https://via.placeholder.com/150",
      "https://via.placeholder.com/150",
    ],
  }),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
  sandpackPlugin({ sandpackConfig: virtuosoSampleSandpackConfig }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: "JavaScript",
      css: "CSS",
      txt: "text",
      tsx: "TypeScript",
    },
  }),
  directivesPlugin({
    directiveDescriptors: [
      YoutubeDirectiveDescriptor,
      AdmonitionDirectiveDescriptor,
    ],
  }),
  diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "boo" }),
  markdownShortcutPlugin(),
];
