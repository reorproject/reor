import React, { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { errorToString } from "@/functions/error";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import { FiRefreshCw } from "react-icons/fi"; // Importing refresh icon from React Icons
import { PromptSuggestion } from "./Chat-Prompts";
import { ChatCompletionChunk } from "openai/resources/chat/completions";
import { ChatHistory } from "electron/main/Store/storeConfig";

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

export type ChatMessageToDisplay = {
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
  const [currentChatHistory, setCurrentChatHistory] = useState<ChatHistory>();
  const [allChatHistories, setAllChatHistories] = useState<ChatHistory[]>();
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [askText, setAskText] = useState<AskOptions>(AskOptions.Ask);
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);

  const fetchDefaultModel = async () => {
    const defaultModelName = await window.llm.getDefaultLLMName();
    setDefaultModel(defaultModelName);
    const allChatHistories = await window.electronStore.getAllChatHistories();
    setAllChatHistories(allChatHistories);
  };
  useEffect(() => {
    fetchDefaultModel();
  }, []);

  // so maybe we could just interact with that whole chat history type basically and just have like an object of that type...
  // or maybe we could just have a chat history type that is just an array of messages and then we can just have a map of that type
  // so yeah, we could just have a chat history type
  const handleSubmitNewMessage = async () => {
    try {
      if (loadingResponse) return;
      if (!userTextFieldInput.trim()) return;
      const defaultLLMName = await window.llm.getDefaultLLMName();

      const currentVisibleMessageHistory =
        currentChatHistory?.displayableChatHistory || [];
      currentVisibleMessageHistory.push({
        role: "user",
        content: userTextFieldInput,
        messageType: "success",
      });
      // setMessageHistoryToDisplay(currentVisibleMessageHistory);
      setUserTextFieldInput("");
      const currentOpenAIMessageHistory =
        currentChatHistory?.openAIChatHistory || [];

      let potentiallyAugmentedPrompt = userTextFieldInput;
      // for now, we'll default to doing rag.

      if (currentOpenAIMessageHistory.length === 0) {
        console.log("augmenting prompt with rag");
        const { ragPrompt } = await window.database.augmentPromptWithRAG(
          userTextFieldInput,
          defaultLLMName
        );
        potentiallyAugmentedPrompt = ragPrompt;
      }

      currentOpenAIMessageHistory.push({
        role: "user",
        content: potentiallyAugmentedPrompt,
      });
      // so here we need to generate an id:
      let chatID = currentChatHistory?.id;
      if (!chatID) {
        // generate an id
        chatID = Date.now().toString();
      }

      setCurrentChatHistory({
        id: chatID,
        displayableChatHistory: currentVisibleMessageHistory,
        openAIChatHistory: currentOpenAIMessageHistory,
      });
      // so we could call save here
      // and then
      await window.electronStore.updateChatHistory({
        id: chatID,
        displayableChatHistory: currentVisibleMessageHistory,
        openAIChatHistory: currentOpenAIMessageHistory,
      });

      const llmConfigs = await window.llm.getLLMConfigs();

      const currentModelConfig = llmConfigs.find(
        (config) => config.modelName === defaultLLMName
      );
      if (!currentModelConfig) {
        throw new Error(`No model config found for model: ${defaultLLMName}`);
      }

      console.log("currentMessageHistory", currentVisibleMessageHistory);

      await window.llm.streamingLLMResponse(
        defaultLLMName,
        currentModelConfig,
        false,
        currentOpenAIMessageHistory
      );
      // once finish streaming, save the message?
      console.log("finished streaming");
    } catch (error) {
      updateMessageHistoryToDisplay(errorToString(error), "error");
    }
    // so here we could save the chat history
    setLoadingResponse(false);
  };

  const updateMessageHistoryToDisplay = (
    newContent: string,
    newMessageType: "success" | "error"
  ) => {
    setCurrentChatHistory((prev) => {
      const newDisplayableHistory = prev?.displayableChatHistory || [];
      if (newDisplayableHistory.length > 0) {
        const lastMessage =
          newDisplayableHistory[newDisplayableHistory.length - 1];

        if (lastMessage.role === "assistant") {
          // Append the new content to the last assistant message
          lastMessage.content += newContent; // Append new content with a space
          lastMessage.messageType = newMessageType;
        } else {
          // Add a new assistant message
          newDisplayableHistory.push({
            role: "assistant",
            content: newContent,
            messageType: newMessageType,
          });
        }
      } else {
        // If the history is empty, just add the new message
        newDisplayableHistory.push({
          role: "assistant",
          content: newContent,
          messageType: newMessageType,
        });
      }
      // so now we have these types, where should generate an id
      // and where should we save the current chat history
      // well I think we know where we should save it

      return {
        id: prev!.id,
        displayableChatHistory: newDisplayableHistory,
        openAIChatHistory: newDisplayableHistory.map((message) => {
          return {
            role: message.role,
            content: message.content,
          };
        }),
      };
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
  }, []);

  return (
    <div className="flex flex-col w-full h-full mx-auto overflow-hidden bg-neutral-800 border-l-[0.001px] border-b-0 border-t-0 border-r-0 border-neutral-700 border-solid">
      <div className="flex w-full items-center">
        {/* simple dropdown component for chat histories */}
        {/* <div className="flex-grow flex justify-center items-center m-0 mt-1 ml-2 mb-1 p-0">
          <select
            className="w-full h-full bg-gray-300 text-gray-500"
            onChange={(e) => {
              const selectedChatHistory = allChatHistories![e.target.value];
              setOpenAIMessageHistory(
                selectedChatHistory.openAIChatHistory
              );
              setMessageHistoryToDisplay(
                selectedChatHistory.displayableChatHistory
              );
            }}
          >
            {allChatHistories &&
              Object.keys(allChatHistories).map((key) => {
                return (
                  <option key={key} value={key}>
                    {key}
                  </option>
                );
              })}
          </select>
        </div> */}
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
          {currentChatHistory?.displayableChatHistory.map((message, index) => (
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
        {userTextFieldInput === "" &&
        currentChatHistory?.displayableChatHistory.length == 0 ? (
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
