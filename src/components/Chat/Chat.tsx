import React, { useState, useEffect, useRef } from "react";
import rehypeRaw from "rehype-raw";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { errorToString } from "@/functions/error";
import { toast } from "react-toastify";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import { FiRefreshCw } from "react-icons/fi"; // Importing refresh icon from React Icons
import { ChatPrompt } from "./Chat-Prompts";
import { CustomLinkMarkdown } from "./CustomLinkMarkdown";
import { ChatCompletionChunk } from "openai/resources/chat/completions";

// convert ask options to enum
enum AskOptions {
  Ask = "Ask",
  AskFile = "Ask File",
  TemporalAsk = "Temporal Ask",
  FlashcardAsk = "Flashcard Ask",
}
const ASK_OPTIONS = Object.values(AskOptions);

const EXAMPLE_PROMPTS: { [key: string]: string[] } = {
  [AskOptions.Ask]: [],
  [AskOptions.AskFile]: [
    "Summarize this file",
    "What are the key points in this file?",
  ],
  [AskOptions.TemporalAsk]: [
    "Summarize what I have worked on today",
    "Which tasks have I completed this past week?",
  ],
  [AskOptions.FlashcardAsk]: [
    "Create some flashcards based on the current note",
  ],
};

type ChatUIMessage = {
  role: "user" | "assistant";
  content: string;
  messageType: "success" | "error";
};

interface ChatWithLLMProps {
  currentFilePath: string | null;
  openFileByPath: (path: string) => Promise<void>;
}

const ChatWithLLM: React.FC<ChatWithLLMProps> = ({
  currentFilePath,
  openFileByPath,
}) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [askText, setAskText] = useState<AskOptions>(AskOptions.Ask);
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [filesReferenced, setFilesReferenced] = useState<string[]>([]);
  const [currentBotMessage, setCurrentBotMessage] =
    useState<ChatUIMessage | null>(null);

  const fetchDefaultModel = async () => {
    const defaultModelName = await window.llm.getDefaultLLMName();
    setDefaultModel(defaultModelName);
  };

  useEffect(() => {
    fetchDefaultModel();
  }, []);

  const fileNotSelectedToastId = useRef<string | null>(null);
  useEffect(() => {
    if (
      !currentFilePath &&
      (askText === AskOptions.AskFile || askText === AskOptions.FlashcardAsk)
    ) {
      fileNotSelectedToastId.current = toast.error(
        `Please open a file before asking questions in ${askText} mode`,
        {}
      ) as string;
    } else if (
      currentFilePath &&
      (askText === AskOptions.AskFile || askText === AskOptions.FlashcardAsk) &&
      fileNotSelectedToastId.current
    ) {
      toast.dismiss(fileNotSelectedToastId.current);
    }
  }, [currentFilePath, askText]);

  const handleSubmitNewMessage = async () => {
    if (loadingResponse) return;
    if (!userTextFieldInput.trim()) return;

    let newMessages = messages;
    if (currentBotMessage) {
      newMessages = [
        ...newMessages,
        {
          role: "assistant",
          messageType: currentBotMessage.messageType,
          content: currentBotMessage.content,
        },
      ];
      setMessages(newMessages);

      setCurrentBotMessage({
        messageType: "success",
        content: "",
        role: "assistant",
      });
    }

    const llmName = await window.llm.getDefaultLLMName();

    let augmentedPrompt: string = "";

    if (askText === AskOptions.AskFile || askText === AskOptions.FlashcardAsk) {
      if (!currentFilePath) {
        console.error(
          "No current file selected. The lack of a file means that there is no context being loaded into the prompt. Please open a file before trying again"
        );

        toast.error(
          "No current file selected. Please open a file before trying again."
        );
        return;
      }
    }
    setMessages([
      ...newMessages,
      { role: "user", messageType: "success", content: userTextFieldInput },
    ]);
    setCurrentBotMessage({
      role: "assistant",
      messageType: "success",
      content: "thinking deeply.....",
    });
    setUserTextFieldInput("");

    try {
      if (askText === AskOptions.AskFile && currentFilePath) {
        const { prompt, contextCutoffAt } =
          await window.files.augmentPromptWithFile({
            prompt: userTextFieldInput,
            llmName: llmName,
            filePath: currentFilePath,
          });
        if (contextCutoffAt) {
          toast.warning(
            `The file is too large to be used as context. It got cut off at: ${contextCutoffAt}`
          );
        }
        augmentedPrompt = prompt;
      } else if (askText === AskOptions.Ask) {
        const { ragPrompt, uniqueFilesReferenced } =
          await window.database.augmentPromptWithRAG(
            userTextFieldInput,
            llmName
          );

        console.log("RAG Prompt:", ragPrompt);
        console.log("Unique files referenced:", uniqueFilesReferenced);

        setFilesReferenced(uniqueFilesReferenced);
        augmentedPrompt = ragPrompt;
      } else if (askText === AskOptions.TemporalAsk) {
        const { ragPrompt, uniqueFilesReferenced } =
          await window.database.augmentPromptWithTemporalAgent({
            query: userTextFieldInput,
            llmName,
          });
        augmentedPrompt = ragPrompt;
        setFilesReferenced(uniqueFilesReferenced);
      } else if (askText === AskOptions.FlashcardAsk && currentFilePath) {
        const { ragPrompt, uniqueFilesReferenced } =
          await window.database.augmentPromptWithFlashcardAgent({
            query: userTextFieldInput,
            llmName,
            filePathToBeUsedAsContext: currentFilePath,
          });

        console.log("RAG Prompt:", ragPrompt);
        console.log("Unique files referenced:", uniqueFilesReferenced);

        setFilesReferenced(uniqueFilesReferenced);
        augmentedPrompt = ragPrompt;
      }
    } catch (error) {
      console.error("Failed to augment prompt:", error);
      toast.error(errorToString(error), {
        className: "mt-5",
        autoClose: false,
        closeOnClick: true,
        draggable: false,
      });
      return;
    }

    startStreamingResponse(llmName, augmentedPrompt);
    setCurrentBotMessage(null);
  };

  const addCollapsibleDetailsInMarkdown = (content: string, title: string) => {
    // <span/> is required to demarcate the start of collapsible details from the markdown line
    return `\n -- -- -- \n <span/> <details> <summary> *${title.trim()}* </summary> \n ${content} </details>`;
  };

  useEffect(() => {
    const updateStream = (chunk: ChatCompletionChunk) => {
      let filesContext = "";
      if (chunk.choices[0].finish_reason && filesReferenced.length > 0) {
        const newBulletedFiles = filesReferenced.map((file, index) => {
          const simplifiedFilePath = file.startsWith(
            window.electronStore.getVaultDirectory()
          )
            ? file.replace(window.electronStore.getVaultDirectory() + "/", "")
            : file;
          return ` ${index + 1}. [${simplifiedFilePath}](#)`;
        });
        filesContext = addCollapsibleDetailsInMarkdown(
          newBulletedFiles.join("  \n"),
          "Files referenced:"
        );
        setFilesReferenced([]); // clear the files referenced after this message
      }
      const newMsgContent = chunk.choices[0].delta.content ?? "";

      if (!newMsgContent && !filesContext) return;
      setCurrentBotMessage((prev) => {
        const newContent = `${
          prev?.content ? prev.content + newMsgContent : newMsgContent
        }`.replace("\n", "<br/>"); // this is because react markdown wth rehype-raw can only HTML <br> instead of newline syntax

        return {
          role: "assistant",
          messageType: "success",
          content: newContent + `${filesContext}`,
        };
      });
    };

    const removeTokenStreamListener = window.ipcRenderer.receive(
      "tokenStream",
      updateStream
    );

    return () => {
      removeTokenStreamListener();
    };
  }, [filesReferenced]);

  const restartSession = async () => {
    fetchDefaultModel();
  };

  const startStreamingResponse = async (
    // sessionId: string,
    llmName: string,
    prompt: string
  ) => {
    try {
      console.log("Initializing streaming response...");
      setLoadingResponse(true);
      const llmConfigs = await window.llm.getLLMConfigs();
      const defaultLLMName = await window.llm.getDefaultLLMName();
      const currentModelConfig = llmConfigs.find(
        (config) => config.modelName === defaultLLMName
      );
      if (!currentModelConfig) {
        throw new Error(`No model config found for model: ${llmName}`);
      }
      await window.llm.streamingLLMResponse(llmName, currentModelConfig, [
        { role: "user", content: prompt },
      ]);
      console.log("Initialized streaming response");
      setLoadingResponse(false);
    } catch (error) {
      setLoadingResponse(false);
      setCurrentBotMessage((prev) => {
        return {
          role: "assistant",
          messageType: "error",
          content: prev?.content
            ? prev.content + "\n" + errorToString(error)
            : errorToString(error),
        };
      });
    }
  };

  // TODO: also check that hitting this when loading is not allowed...
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (!e.shiftKey && e.key == "Enter") {
      e.preventDefault();
      handleSubmitNewMessage();
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setUserTextFieldInput(e.target.value);
  };

  return (
    <div className="flex flex-col w-full h-full mx-auto overflow-hidden bg-neutral-800 border-l-[0.001px] border-b-0 border-t-0 border-r-0 border-neutral-700 border-solid">
      <div className="flex w-full items-center">
        <div className="flex-grow flex justify-center items-center m-0 mt-1 ml-2 mb-1 p-0">
          {defaultModel ? (
            <p className="m-0 p-0 text-gray-500">{defaultModel}</p>
          ) : (
            <p className="m-0 p-0 text-gray-500">No default model selected</p>
          )}
        </div>
        <div className="pr-2 pt-1 cursor-pointer" onClick={restartSession}>
          <FiRefreshCw className="text-gray-300" title="Restart Session" />{" "}
        </div>
      </div>
      <div className="flex flex-col overflow-auto p-3 pt-0 bg-transparent h-full">
        <div className="space-y-2 mt-4 flex-grow">
          {messages.map((message, index) => (
            <ReactMarkdown
              key={index}
              rehypePlugins={[rehypeRaw]}
              className={`p-1 pl-1 markdown-content rounded-lg break-words ${
                message.messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : message.role === "assistant"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              } `}
            >
              {message.content}
            </ReactMarkdown>
          ))}
          {currentBotMessage && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              className={`p-1 pl-1 markdown-content rounded-lg break-words ${
                currentBotMessage.messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              } `}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                a: ({ node, ...props }) => (
                  <CustomLinkMarkdown
                    props={props}
                    openFileByPath={openFileByPath}
                  />
                ),
              }}
            >
              {currentBotMessage.content}
            </ReactMarkdown>
          )}
        </div>
        {userTextFieldInput === "" && messages.length == 0 ? (
          <>
            {EXAMPLE_PROMPTS[askText].map((option, index) => {
              return (
                <ChatPrompt
                  key={index}
                  promptText={option}
                  onClick={() => {
                    console.log(option);
                    setUserTextFieldInput(option);
                  }}
                />
              );
            })}
          </>
        ) : undefined}
      </div>
      <div className="p-3 bg-neutral-600">
        <div className="flex space-x-2 h-full">
          <Textarea
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            value={userTextFieldInput}
            className="w-full  bg-gray-300"
            name="Outlined"
            placeholder="Ask your knowledge..."
            variant="outlined"
            style={{
              backgroundColor: "rgb(64 64 64)",
              color: "rgb(212 212 212)",
            }}
          />
          <div className="flex justify-center items-center h-full ">
            {loadingResponse ? (
              <CircularProgress
                size={32}
                thickness={20}
                style={{ color: "rgb(209 213 219 / var(--tw-bg-opacity))" }}
                className="h-full w-full m-x-auto color-gray-500 "
              />
            ) : (
              <>
                <button
                  aria-expanded="false"
                  aria-haspopup="menu"
                  className={`align-middle select-none font-sans font-bold transition-all 
                  text-xs py-3 px-6 rounded-tl rounded-bl text-white shadow-md shadow-gray-900/10 
                  hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] 
                  active:shadow-none bg-neutral-700 border-none h-full hover:bg-neutral-900 cursor-pointer text-center 
                  pt-0 pb-0 pr-2 pl-2`}
                  type="button"
                  onClick={handleSubmitNewMessage}
                >
                  {askText}
                </button>
                <Menu placement="top-end">
                  <MenuHandler>
                    <button
                      aria-expanded="false"
                      aria-haspopup="menu"
                      className={`align-middle select-none font-sans font-bold uppercase transition-all 
                  text-xs py-3 px-6 rounded-tr rounded-br text-white shadow-md shadow-gray-900/10 
                  hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] 
                  active:shadow-none bg-neutral-700 border-none h-full hover:bg-neutral-900 cursor-pointer text-center 
                  pt-0 pb-0 pr-2 pl-2`}
                      type="button"
                    >
                      <div className="mb-1">⌄</div>
                    </button>
                  </MenuHandler>
                  <MenuList placeholder="" className="bg-neutral-600">
                    {ASK_OPTIONS.map((option, index) => {
                      return (
                        <MenuItem
                          key={index}
                          placeholder=""
                          className="bg-neutral-600 border-none h-full w-full hover:bg-neutral-700 cursor-pointer text-white text-left p-2"
                          onClick={() => setAskText(option)}
                        >
                          {option}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithLLM;
