// FileEditor.tsx
import "@mdxeditor/editor/style.css";
import React, { useEffect, useState } from "react";
import {
  AdmonitionDirectiveDescriptor,
  DiffSourceToggleWrapper,
  DirectiveDescriptor,
  KitchenSinkToolbar,
  MDXEditor,
  MDXEditorMethods,
  SandpackConfig,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  sandpackPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { LeafDirective } from "mdast-util-directive";

interface FileEditorProps {
  filePath: string;
}

const markdown = `
  * Item 1
  * Item 2
  * Item 3
    * nested item

  1. Item 1
  2. Item 2
`;

export const FileEditor: React.FC<FileEditorProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>("");
  const ref = React.useRef<MDXEditorMethods>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const fileContent = await window.ipcRenderer.invoke(
        "read-file",
        filePath
      );
      setContent(fileContent);
    };

    if (filePath) {
      fetchContent();
    }
  }, [filePath]);

  const saveFile = async () => {
    await window.ipcRenderer.invoke("write-file", filePath, content);
  };

  useEffect(() => {
    console.log("content: ", content);
  }, [content]);

  return (
    <div className="p-4">
      {/* <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 border p-2"
      /> */}
      <button onClick={() => ref.current?.setMarkdown("new markdown")}>
        Set new markdown
      </button>
      <button onClick={() => console.log(ref.current?.getMarkdown())}>
        Get markdown
      </button>
      {/* <MDXEditor ref={ref} markdown="hello world" onChange={console.log} />{" "} */}
      return{" "}
      <MDXEditor
        ref={ref}
        onChange={setContent}
        markdown={markdown}
        plugins={ALL_PLUGINS}
      />
      {/* <MDXEditor
        onChange={console.log}
        markdown={markdown}
        contentEditableClassName="prose"
        plugins={[
          // the viewMode parameter lets you switch the editor to diff or source mode.
          // you can get the diffMarkdown from your backend and pass it here.
          diffSourcePlugin({
            diffMarkdown: "An older version",
            viewMode: "rich-text",
          }),
          headingsPlugin(),
          listsPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      /> */}
      <button onClick={saveFile} className="mt-4 bg-blue-500 text-white p-2">
        Save
      </button>
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
  toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
  linkPlugin(),
  linkDialogPlugin(),
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
