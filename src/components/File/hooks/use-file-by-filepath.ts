import { useEffect, useState } from "react";
import { useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import "../tiptap.scss";
import { useDebounce } from "use-debounce";
import { Markdown } from "tiptap-markdown";
import { RichTextLink } from "@/components/Editor/RichTextLink";

import {
  BacklinkExtension,
  SuggestionsState,
} from "@/components/Editor/TrReplaceSuggestions";

export const useFileByFilepath = () => {
  const [currentlyOpenedFilePath, setCurrentlyOpenedFilePath] = useState<
    string | null
  >(null);
  const [suggestionsState, setSuggestionsState] = useState<SuggestionsState>({
    suggestions: [],
    position: { left: 0, top: 0 },
  });
  /**
	 * with this editor, we want to take the HTML on the following scenarios:
		1. when the file path changes, causing a re-render
		2. When the component unmounts
		3. when the file is deleted
	 */
  Markdown.configure({
    html: true, // Allow HTML input/output
    tightLists: true, // No <p> inside <li> in markdown output
    tightListClass: "tight", // Add class to <ul> allowing you to remove <p> margins when tight
    bulletListMarker: "-", // <li> prefix in markdown output
    linkify: false, // Create links from "https://..." text
    breaks: true, // New lines (\n) in markdown input are converted to <br>
    transformPastedText: false, // Allow to paste markdown text in the editor
    transformCopiedText: false, // Copied text is transformed to markdown
  });

  const testOpenFile = async (filePath: string) => {
    console.log("opening file: ", filePath);
  };

  const editor = useEditor({
    autofocus: true,

    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      TaskList,
      Markdown,

      TaskItem.configure({
        nested: true,
      }),
      // Commands,
      // slashCommand,
      BacklinkExtension(testOpenFile, setSuggestionsState),
      // .configure({
      //   suggestion: {
      //     // items: getSuggestionItems,
      //     // render: renderItems
      //   }
      // })

      RichTextLink,
    ],
  });

  useEffect(() => {
    const handleClick = (event) => {
      const element = event.target;
      if (element.tagName === "A" && element.href) {
        event.preventDefault();
        window.electron.openExternal(element.href);
      }
    };

    // Add event listener to document to capture click events
    document.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const [debouncedEditor] = useDebounce(editor?.state.doc.content, 4000);

  useEffect(() => {
    if (debouncedEditor) {
      saveEditorContentToPath(editor, currentlyOpenedFilePath, false);
    }
  }, [debouncedEditor, currentlyOpenedFilePath, editor]);

  const saveCurrentlyOpenedFile = async () => {
    saveEditorContentToPath(editor, currentlyOpenedFilePath);
  };

  const saveEditorContentToPath = async (
    editor: Editor | null,
    filePath: string | null,
    indexFileInDatabase: boolean = false
  ) => {
    if (editor && editor?.getHTML() !== null && filePath !== null) {
      const markdown = getMarkdown(editor);
      // const text = editor?.getText();
      console.log("markdown IS: ", markdown);
      await window.files.writeFile({
        filePath: filePath,
        content: markdown,
      });
      if (indexFileInDatabase) {
        await window.files.indexFileInDatabase(filePath);
      }
    }
  };
  // read file, load content into fileContent
  const openFileByPath = async (newFilePath: string) => {
    //if the fileContent is null or if there is no file currently selected

    saveEditorContentToPath(editor, currentlyOpenedFilePath, true);

    const fileContent = (await window.files.readFile(newFilePath)) ?? "";
    setCurrentlyOpenedFilePath(newFilePath);

    editor?.commands.setContent(fileContent);
  };

  // delete file depending on file path returned by the listener
  useEffect(() => {
    let active = true;
    console.log("now active");
    const deleteFile = async (path: string) => {
      console.log("listener got file path: ", path);
      if (!active) return;
      console.log("listener is active");

      await window.files.deleteFile(path);

      // if it is the current file, clear the content and set filepath to null so that it won't save anything else
      if (currentlyOpenedFilePath === path) {
        editor?.commands.setContent("");
        setCurrentlyOpenedFilePath(null);
      }
    };

    window.ipcRenderer.receive("delete-file-listener", deleteFile);

    return () => {
      active = false;
      console.log("cleanup effect ran");
      window.ipcRenderer.removeListener("delete-file-listener", deleteFile);
    };
  }, [currentlyOpenedFilePath, editor]);

  // cleanup effect ran once, so there was only 1 re-render
  // but for each query to the delete file-listener, you only want to run the listener once, not multiple times.
  // the listener function is ran multiple times, mostly before the cleanup is done, so apparently there are eihther multiple listeners being added, or the event is fired multiple times
  // if multiple listeners -> each of them are given the same active variable so if it mutates, it will all
  // if the event is fired multiple times, each of the time it fires, it keeps going until the function is completed

  // after the effect is re-rendered, it listens to the function properly with active = true.

  // 1. Close window on the backend, trigger savefile
  // 2. on the FE, receives win.webContents.send("prepare-for-window-close", files);
  // 3. FE after saving, alerts backend that is ready for close
  useEffect(() => {
    let active = true;
    const handleWindowClose = async () => {
      if (!active) return;
      console.log("saving file", {
        filePath: currentlyOpenedFilePath,
        fileContent: editor?.getHTML() || "",
        editor: editor,
      });
      if (
        currentlyOpenedFilePath !== null &&
        editor &&
        editor.getHTML() !== null
      ) {
        const markdown = getMarkdown(editor);
        await window.files.writeFile({
          filePath: currentlyOpenedFilePath,
          content: markdown,
        });
        await window.files.indexFileInDatabase(currentlyOpenedFilePath);
      }

      window.electron.destroyWindow();
    };

    window.ipcRenderer.receive("prepare-for-window-close", handleWindowClose);

    return () => {
      active = false;
      window.ipcRenderer.removeListener(
        "prepare-for-window-close",
        handleWindowClose
      );
    };
  }, [currentlyOpenedFilePath, editor]);

  return {
    filePath: currentlyOpenedFilePath,
    saveCurrentlyOpenedFile,
    editor,
    openFileByPath,
    suggestionsState,
  };
};

function getMarkdown(editor: Editor) {
  // Fetch the current markdown content from the editor
  const originalMarkdown = editor.storage.markdown.getMarkdown();
  console.log("original markdown: ", originalMarkdown);
  // Replace the escaped square brackets with unescaped ones
  const modifiedMarkdown = originalMarkdown
    .replace(/\\\[/g, "[") // Replaces \[ with [
    .replace(/\\\]/g, "]"); // Replaces \] with ]

  return modifiedMarkdown;
}
