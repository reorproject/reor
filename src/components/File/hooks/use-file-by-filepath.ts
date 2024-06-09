import { useEffect, useRef, useState } from "react";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import { useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "../tiptap.scss";

import { toast } from "react-toastify";
import { Markdown } from "tiptap-markdown";
import { useDebounce } from "use-debounce";

import { BacklinkExtension } from "@/components/Editor/BacklinkExtension";
import { SuggestionsState } from "@/components/Editor/BacklinkSuggestionsDisplay";
import HighlightExtension, {
  HighlightData,
} from "@/components/Editor/HighlightExtension";
import { RichTextLink } from "@/components/Editor/RichTextLink";
import {
  getInvalidCharacterInFilePath,
  removeFileExtension,
} from "@/functions/strings";

export const useFileByFilepath = () => {
  const [currentlyOpenedFilePath, setCurrentlyOpenedFilePath] = useState<
    string | null
  >(null);
  const [suggestionsState, setSuggestionsState] =
    useState<SuggestionsState | null>();
  const [needToWriteEditorContentToDisk, setNeedToWriteEditorContentToDisk] =
    useState<boolean>(false);
  const [needToIndexEditorContent, setNeedToIndexEditorContent] =
    useState<boolean>(false);
  const [noteToBeRenamed, setNoteToBeRenamed] = useState<string>("");
  const [fileDirToBeRenamed, setFileDirToBeRenamed] = useState<string>("");
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentlyChangingFilePath, setCurrentlyChangingFilePath] =
    useState(false);
  const [highlightData, setHighlightData] = useState<HighlightData>({
    text: "",
    position: null,
  });

  const setFileNodeToBeRenamed = async (filePath: string) => {
    const isDirectory = await window.files.isDirectory(filePath);
    if (isDirectory) {
      setFileDirToBeRenamed(filePath);
    } else {
      setNoteToBeRenamed(filePath);
    }
  };

  /**
	 * with this editor, we want to take the HTML on the following scenarios:
		1. when the file path changes, causing a re-render
		2. When the component unmounts
		3. when the file is deleted
	 */

  const openFileByPath = async (newFilePath: string) => {
    setCurrentlyChangingFilePath(true);
    await writeEditorContentToDisk(editor, currentlyOpenedFilePath);
    if (currentlyOpenedFilePath && needToIndexEditorContent) {
      window.files.indexFileInDatabase(currentlyOpenedFilePath);
      setNeedToIndexEditorContent(false);
    }
    const newFileContent = (await window.files.readFile(newFilePath)) ?? "";
    editor?.commands.setContent(newFileContent);
    setCurrentlyOpenedFilePath(newFilePath);
    setCurrentlyChangingFilePath(false);
  };

  const openRelativePath = async (
    relativePath: string,
    optionalContentToWriteOnCreate?: string
  ): Promise<void> => {
    const invalidChars = await getInvalidCharacterInFilePath(relativePath);
    if (invalidChars) {
      toast.error(
        `Could not create note ${relativePath}. Character ${invalidChars} cannot be included in note name.`
      );
      throw new Error(
        `Could not create note ${relativePath}. Character ${invalidChars} cannot be included in note name.`
      );
    }
    const relativePathWithExtension =
      await window.path.addExtensionIfNoExtensionPresent(relativePath);
    const absolutePath = await window.path.join(
      await window.electronStore.getVaultDirectoryForWindow(),
      relativePathWithExtension
    );
    const fileExists = await window.files.checkFileExists(absolutePath);
    if (!fileExists) {
      const basename = await window.path.basename(absolutePath);
      const content = optionalContentToWriteOnCreate
        ? optionalContentToWriteOnCreate
        : "## " + removeFileExtension(basename) + "\n";
      await window.files.createFile(absolutePath, content);
      setNeedToIndexEditorContent(true);
    }
    openFileByPath(absolutePath);
  };

  const openRelativePathRef = useRef<(newFilePath: string) => Promise<void>>();
  openRelativePathRef.current = openRelativePath;

  const handleSuggestionsStateWithEventCapture = (
    suggState: SuggestionsState | null
  ): void => {
    setSuggestionsState(suggState);
  };

  const editor = useEditor({
    autofocus: true,

    onUpdate() {
      setNeedToWriteEditorContentToDisk(true);
      setNeedToIndexEditorContent(true);
    },
    editorProps: {
      attributes: {
        spellcheck: "false", // Disable spellcheck
      },
    },
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      TaskList,
      Markdown.configure({
        html: true, // Allow HTML input/output
        tightLists: true, // No <p> inside <li> in markdown output
        tightListClass: "tight", // Add class to <ul> allowing you to remove <p> margins when tight
        bulletListMarker: "-", // <li> prefix in markdown output
        linkify: true, // Create links from "https://..." text
        breaks: true, // New lines (\n) in markdown input are converted to <br>
        transformPastedText: true, // Allow to paste markdown text in the editor
        transformCopiedText: true, // Copied text is transformed to markdown
      }),
      TaskItem.configure({
        nested: true,
      }),
      HighlightExtension(setHighlightData),
      RichTextLink.configure({
        linkOnPaste: true,
        openOnClick: true,
      }),
      BacklinkExtension(
        openRelativePathRef,
        handleSuggestionsStateWithEventCapture
      ),
    ],
  });

  const [debouncedEditor] = useDebounce(editor?.state.doc.content, 4000);

  useEffect(() => {
    if (debouncedEditor && !currentlyChangingFilePath) {
      writeEditorContentToDisk(editor, currentlyOpenedFilePath);
    }
  }, [
    debouncedEditor,
    currentlyOpenedFilePath,
    editor,
    currentlyChangingFilePath,
  ]);

  const saveCurrentlyOpenedFile = async () => {
    await writeEditorContentToDisk(editor, currentlyOpenedFilePath);
  };

  const writeEditorContentToDisk = async (
    editor: Editor | null,
    filePath: string | null
  ) => {
    if (filePath !== null && needToWriteEditorContentToDisk && editor) {
      const markdownContent = getMarkdown(editor);
      if (markdownContent !== null) {
        await window.files.writeFile({
          filePath: filePath,
          content: markdownContent,
        });

        console.log(
          "setting is file content modified to false in actual save function"
        );
        setNeedToWriteEditorContentToDisk(false);
      }
    }
  };

  // delete file depending on file path returned by the listener
  useEffect(() => {
    const deleteFile = async (path: string) => {
      await window.files.deleteFile(path);

      // if it is the current file, clear the content and set filepath to null so that it won't save anything else
      if (currentlyOpenedFilePath === path) {
        editor?.commands.setContent("");
        setCurrentlyOpenedFilePath(null);
      }
    };

    const removeDeleteFileListener = window.ipcRenderer.receive(
      "delete-file-listener",
      deleteFile
    );

    return () => {
      removeDeleteFileListener();
    };
  }, [currentlyOpenedFilePath, editor]);

  useEffect(() => {
    async function checkAppUsage() {
      if (!editor || currentlyOpenedFilePath) return;
      const hasOpened = await window.electronStore.getHasUserOpenedAppBefore();
      console.log("has opened", hasOpened);
      if (!hasOpened) {
        console.log("opening welcome note");
        await window.electronStore.setHasUserOpenedAppBefore();
        openRelativePath("Welcome to Reor", welcomeNote);
      }
    }

    checkAppUsage();
  }, [editor, currentlyOpenedFilePath]);

  const renameFileNode = async (oldFilePath: string, newFilePath: string) => {
    await window.files.renameFileRecursive({
      oldFilePath,
      newFilePath,
    });
    //set the file history array to use the new absolute file path if there is anything matching
    const navigationHistoryUpdated = [...navigationHistory].map((path) => {
      return path.replace(oldFilePath, newFilePath);
    });

    setNavigationHistory(navigationHistoryUpdated);

    //reset the editor to the new file path
    if (currentlyOpenedFilePath === oldFilePath) {
      setCurrentlyOpenedFilePath(newFilePath);
    }
  };

  // open a new file rename dialog
  useEffect(() => {
    const renameFileListener = window.ipcRenderer.receive(
      "rename-file-listener",
      (noteName: string) => setFileNodeToBeRenamed(noteName)
    );

    return () => {
      renameFileListener();
    };
  }, []);

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
    const handleWindowClose = async () => {
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
    };

    const removeWindowCloseListener = window.ipcRenderer.receive(
      "prepare-for-window-close",
      handleWindowClose
    );

    return () => {
      removeWindowCloseListener();
    };
  }, [currentlyOpenedFilePath, editor]);

  return {
    filePath: currentlyOpenedFilePath,
    saveCurrentlyOpenedFile,
    editor,
    navigationHistory,
    setNavigationHistory,
    openFileByPath,
    openRelativePath,
    suggestionsState,
    highlightData,
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile: renameFileNode,
    setSuggestionsState,
  };
};

function getMarkdown(editor: Editor) {
  // Fetch the current markdown content from the editor
  const originalMarkdown = editor.storage.markdown.getMarkdown();
  // Replace the escaped square brackets with unescaped ones
  const modifiedMarkdown = originalMarkdown
    .replace(/\\\[/g, "[") // Replaces \[ with [
    .replace(/\\\]/g, "]"); // Replaces \] with ]

  return modifiedMarkdown;
}

const welcomeNote = `## Welcome to Reor!

Reor is a private AI personal knowledge management tool. Our philosophy is that AI should be a thought enhancer not a thought replacer: Reor helps you find & connect notes, discover new insights and enhance your reasoning.

Some features you should be aware of:

- **Links:**

  - Reor automatically links your notes to other notes in the Related Notes sidebar.

  - You can view the Related Notes to a particular chunk of text by highlighting it and hitting the button that appears.

  - You can also create inline links by surrounding text with two square brackets (like in Obsidian). [[Like this]]

- **Chat:**

  - Ask your entire set of notes anything you want to know! Reor will automatically give the LLM relevant context.

  - Ask things like “What are my thoughts on philosophy?” or “Summarize my notes on black holes"

  - In settings, you can attach a local LLM or connect to OpenAI models with your API key.

- **AI Flashcards:**

  - Generate flashcards from any note by going to the chat window and hitting the toggle in the bottom right to "Flashcard Ask" mode.

  - Then generate flashcards by running a prompt like "Generate flashcards for this note"

  - Then hit the flashcard icon in the left sidebar to see your flashcards :)

You can import notes from other apps by adding markdown files to your vault directory. Note that Reor will only read markdown files.

Please join our [Discord community](https://discord.gg/QBhGUFJYuH) to ask questions, give feedback, and get help. We're excited to have you on board!`;
