import { useEffect, useState } from "react";
import { useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import Link from "@tiptap/extension-link";
import "../tiptap.scss";
import { useDebounce } from "use-debounce";
import { Markdown } from "tiptap-markdown";

export const useFileByFilepath = () => {
  const [currentlyOpenedFilePath, setCurrentlyOpenedFilePath] = useState<
    string | null
  >(null);

  const [isFileContentModified, setIsFileContentModified] =
    useState<boolean>(false);
  const [noteToBeRenamed, setNoteToBeRenamed] = useState<string>("");
  const [fileDirToBeRenamed, setFileDirToBeRenamed] = useState<string>("");
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentlyChangingFilePath, setCurrentlyChangingFilePath] =
    useState(false);

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

  const editor = useEditor({
    onUpdate() {
      setIsFileContentModified(true);
    },
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
      Link.configure({
        linkOnPaste: true,
        openOnClick: true,
      }),
    ],
  });

  const [debouncedEditor] = useDebounce(editor?.state.doc.content, 4000);

  useEffect(() => {
    if (debouncedEditor && !currentlyChangingFilePath) {
      saveEditorContentToPath(editor, currentlyOpenedFilePath);
    }
  }, [
    debouncedEditor,
    currentlyOpenedFilePath,
    editor,
    currentlyChangingFilePath,
  ]);

  const saveCurrentlyOpenedFile = async () => {
    await saveEditorContentToPath(editor, currentlyOpenedFilePath);
  };

  const saveEditorContentToPath = async (
    editor: Editor | null,
    filePath: string | null,
    indexFileInDatabase: boolean = false
  ) => {
    const markdownContent = editor?.storage.markdown.getMarkdown();
    if (
      markdownContent !== null &&
      filePath !== null &&
      isFileContentModified
    ) {
      await window.files.writeFile({
        filePath: filePath,
        content: markdownContent,
      });

      setIsFileContentModified(false);

      if (indexFileInDatabase) {
        window.files.indexFileInDatabase(filePath);
      }
    }
  };
  const findTextPosition = (
    editor: Editor | null,
    searchString: string
  ): number | undefined => {
    const position = editor?.state.doc.textContent.indexOf(searchString);

    return position;
  };
  const openFileByPath = async (newFilePath: string, content?: string) => {
    setCurrentlyChangingFilePath(true);
    await saveEditorContentToPath(editor, currentlyOpenedFilePath, true);
    const fileContent = (await window.files.readFile(newFilePath)) ?? "";
    setCurrentlyOpenedFilePath(newFilePath);

    editor?.commands.setContent(fileContent);
    console.log(content);
    if (content) {
      const textPos = findTextPosition(editor, content);
      console.log("textpos", textPos);
      textPos
        ? editor?.commands.setTextSelection({
            from: textPos,
            to: textPos + content.length,
          })
        : undefined;

      editor?.commands.focus();
      editor?.commands.scrollIntoView();
    }
    setCurrentlyChangingFilePath(false);
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
        const markdown = editor?.storage.markdown.getMarkdown();
        await window.files.writeFile({
          filePath: currentlyOpenedFilePath,
          content: markdown,
        });
        await window.files.indexFileInDatabase(currentlyOpenedFilePath);
      }

      window.electron.destroyWindow();
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
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile: renameFileNode,
  };
};
