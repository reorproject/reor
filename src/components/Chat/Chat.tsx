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
import { PromptSuggestion } from "./Chat-Prompts";
import { CustomLinkMarkdown } from "./CustomLinkMarkdown";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { ChatAction } from "./ChatAction";
import {
  storeFlashcardPairsAsJSON,
  canBeParsedAsFlashcardQAPair,
  CONVERT_TO_FLASHCARDS_FROM_CHAT,
  parseChatMessageIntoFlashcardPairs,
} from "../Flashcard";
import { addCollapsibleDetailsInMarkdown } from "./utils";

// convert ask options to enum
enum AskOptions {
  Ask = "Ask",
  // AskFile = "Ask File",
  // TemporalAsk = "Temporal Ask",
  // FlashcardAsk = "Flashcard Ask",
}
const ASK_OPTIONS = Object.values(AskOptions);

const EXAMPLE_PROMPTS: { [key: string]: string[] } = {
  [AskOptions.Ask]: [],
  // [AskOptions.AskFile]: [
  //   "Summarize this file",
  //   "What are the key points in this file?",
  // ],
  // [AskOptions.TemporalAsk]: [
  //   "Summarize what I have worked on today",
  //   "Which tasks have I completed this past week?",
  // ],
  // [AskOptions.FlashcardAsk]: [
  //   "Create some flashcards based on the current note",
  // ],
};

const FILE_REFERENCE_DELIMITER = "\n -- -- -- \n";

type MessageToDisplay = {
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
  const [messagesHistoryToDisplay, setMessageHistoryToDisplay] = useState<
    MessageToDisplay[]
  >([]);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [askText, setAskText] = useState<AskOptions>(AskOptions.Ask);
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [canGenerateFlashcard, setCanGenerateFlashcard] =
    useState<boolean>(false);
  const [filesReferenced, setFilesReferenced] = useState<string[]>([]);

  const fetchDefaultModel = async () => {
    const defaultModelName = await window.llm.getDefaultLLMName();
    setDefaultModel(defaultModelName);
  };
  useEffect(() => {
    fetchDefaultModel();
  }, []);

  // const fileNotSelectedToastId = useRef<string | null>(null);

  const handleSubmitNewMessage = async () => {
    if (loadingResponse) return;
    if (!userTextFieldInput.trim()) return;

    const llmName = await window.llm.getDefaultLLMName();

    let augmentedPrompt: string = "";

    setMessageHistoryToDisplay((prev) => [
      ...prev,
      { role: "user", messageType: "success", content: userTextFieldInput },
    ]);
    setUserTextFieldInput("");

    try {
      if (askText === AskOptions.Ask) {
        const { ragPrompt, uniqueFilesReferenced } =
          await window.database.augmentPromptWithRAG(
            userTextFieldInput,
            llmName
          );

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

    startStreamingResponse(llmName, augmentedPrompt, false);
  };

  // let filesContext = "";

  // if (chunk.choices[0].finish_reason) {
  //   if (filesReferenced.length > 0) {
  //     const vaultDir =
  //       await window.electronStore.getVaultDirectoryForWindow();

  //     const newBulletedFiles = await Promise.all(
  //       filesReferenced.map(async (file, index) => {
  //         const relativePath = await window.path.relative(vaultDir, file);
  //         return ` ${index + 1}. [${relativePath}](#)`;
  //       })
  //     );

  //     filesContext = addCollapsibleDetailsInMarkdown(
  //       newBulletedFiles.join("  \n"),
  //       "Files referenced:",
  //       FILE_REFERENCE_DELIMITER
  //     );
  //     setFilesReferenced([]);
  //   }
  // }

  const updateMessageHistoryToDisplay = (
    newContent: string,
    newMessageType: "success" | "error"
  ) => {
    setMessageHistoryToDisplay((prev) => {
      const newHistory = [...prev];

      if (newHistory.length > 0) {
        const lastMessage = newHistory[newHistory.length - 1];

        if (lastMessage.role === "assistant") {
          // Append the new content to the last assistant message
          lastMessage.content += newContent; // Append new content with a space
          lastMessage.messageType = newMessageType;
        } else {
          // Add a new assistant message
          newHistory.push({
            role: "assistant",
            content: newContent,
            messageType: newMessageType,
          });
        }
      } else {
        // If the history is empty, just add the new message
        newHistory.push({
          role: "assistant",
          content: newContent,
          messageType: newMessageType,
        });
      }
      return newHistory;
    });
  };

  useEffect(() => {
    const handleChunk = async (chunk: ChatCompletionChunk) => {
      const newContent = chunk.choices[0].delta.content ?? "";
      if (newContent) {
        updateMessageHistoryToDisplay(newContent, "success");
      }
    };

    const removeTokenStreamListener = window.ipcRenderer.receive(
      "tokenStream",
      handleChunk
    );

    return () => {
      removeTokenStreamListener();
    };
  }, [filesReferenced]);

  const startStreamingResponse = async (
    llmName: string,
    prompt: string,
    isJSONMode: boolean
  ) => {
    try {
      setLoadingResponse(true);
      const llmConfigs = await window.llm.getLLMConfigs();
      const defaultLLMName = await window.llm.getDefaultLLMName();
      const currentModelConfig = llmConfigs.find(
        (config) => config.modelName === defaultLLMName
      );
      if (!currentModelConfig) {
        throw new Error(`No model config found for model: ${llmName}`);
      }
      const llmMessageHistory: ChatCompletionMessageParam[] = [
        { role: "user", content: prompt },
      ];
      await window.llm.streamingLLMResponse(
        llmName,
        currentModelConfig,
        isJSONMode,
        llmMessageHistory
      );
    } catch (error) {
      updateMessageHistoryToDisplay(errorToString(error), "error");
    }
    setLoadingResponse(false);
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
        <div className="pr-2 pt-1 cursor-pointer" onClick={fetchDefaultModel}>
          <FiRefreshCw className="text-gray-300" title="Restart Session" />{" "}
        </div>
      </div>
      <div className="flex flex-col overflow-auto p-3 pt-0 bg-transparent h-full">
        <div className="space-y-2 mt-4 flex-grow">
          {messagesHistoryToDisplay.map((message, index) => (
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
          {/* {currentVisibleStreamingAssistantMessage && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              className={`p-1 pl-1 markdown-content rounded-lg break-words ${
                currentVisibleStreamingAssistantMessage.messageType === "error"
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
              {currentVisibleStreamingAssistantMessage.content}
            </ReactMarkdown>
          )} */}
        </div>
        {/* {canGenerateFlashcard &&
          currentVisibleStreamingAssistantMessage &&
          canBeParsedAsFlashcardQAPair(
            currentVisibleStreamingAssistantMessage.content
          ) && (
            <ChatAction
              actionText={CONVERT_TO_FLASHCARDS_FROM_CHAT}
              onClick={async () => {
                const flashcardQAPairs = parseChatMessageIntoFlashcardPairs(
                  currentVisibleStreamingAssistantMessage.content,
                  FILE_REFERENCE_DELIMITER
                );
                await storeFlashcardPairsAsJSON(
                  flashcardQAPairs,
                  currentFilePath
                );
                setCanGenerateFlashcard(false);
              }}
            />
          )} */}
        {userTextFieldInput === "" && messagesHistoryToDisplay.length == 0 ? (
          <>
            {EXAMPLE_PROMPTS[askText].map((option, index) => {
              return (
                <PromptSuggestion
                  key={index}
                  promptText={option}
                  onClick={() => {
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
            onKeyDown={(e) => {
              if (!e.shiftKey && e.key === "Enter") {
                e.preventDefault();
                handleSubmitNewMessage();
              }
            }}
            onChange={(e) => setUserTextFieldInput(e.target.value)}
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
