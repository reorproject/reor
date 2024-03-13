import React, { useState, useEffect, useRef } from "react";
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
import { ChatCompletionChunk } from "openai/resources/chat/completions";

// convert ask options to enum
enum AskOptions {
  Ask = "Ask",
  AskFile = "Ask file",
}
const ASK_OPTIONS = Object.values(AskOptions);

const PROMPT_OPTIONS = [
  "Generate weekly 1-1 talking points from this file",
  "Separate concepts from todos",
]; // more options to come

type ChatUIMessage = {
  role: "user" | "assistant";
  content: string;
  messageType: "success" | "error";
};

interface ChatWithLLMProps {
  currentFilePath: string | null;
}

const ChatWithLLM: React.FC<ChatWithLLMProps> = ({ currentFilePath }) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [askText, setAskText] = useState<string>("Ask");
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [currentBotMessage, setCurrentBotMessage] =
    useState<ChatUIMessage | null>(null);
  const fileNotSelectedToastId = useRef<string | null>(null);

  const fetchDefaultModel = async () => {
    const defaultModelName = await window.electronStore.getDefaultLLMName();
    setDefaultModel(defaultModelName);
  };
  useEffect(() => {
    fetchDefaultModel();
  }, []);

  useEffect(() => {
    if (!currentFilePath && askText === AskOptions.AskFile) {
      fileNotSelectedToastId.current = toast.error(
        "Please open a file before asking questions in ask file mode",
        {}
      ) as string;
    } else if (
      currentFilePath &&
      askText === AskOptions.AskFile &&
      fileNotSelectedToastId.current
    ) {
      toast.dismiss(fileNotSelectedToastId.current);
    }
  }, [currentFilePath, askText]);

  const handleSubmitNewMessage = async () => {
    if (loadingResponse) return;
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
    if (!userTextFieldInput.trim()) return;
    const llmName = await window.electronStore.getDefaultLLMName();

    let augmentedPrompt: string = "";
    try {
      if (askText === AskOptions.AskFile) {
        if (!currentFilePath) {
          console.error(
            "No current file selected. The lack of a file means that there is no context being loaded into the prompt. Please open a file before trying again"
          );

          toast.error(
            "No current file selected. Please open a file before trying again."
          );
          return;
        }
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
        augmentedPrompt = await window.database.augmentPromptWithRAG(
          userTextFieldInput,
          llmName
        );
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

    setMessages([
      ...newMessages,
      { role: "user", messageType: "success", content: userTextFieldInput },
    ]);
    setUserTextFieldInput("");
  };

  useEffect(() => {
    let active = true;
    const updateStream = (chunk: ChatCompletionChunk) => {
      if (!active) return;
      const newMsgContent = chunk.choices[0].delta.content;
      if (!newMsgContent) return;
      setCurrentBotMessage((prev) => {
        return {
          role: "assistant",
          messageType: "success",
          content: prev?.content ? prev.content + newMsgContent : newMsgContent,
        };
      });
    };

    window.ipcRenderer.receive("tokenStream", updateStream);

    return () => {
      active = false;
      window.ipcRenderer.removeListener("tokenStream", updateStream);
    };
  }, []);

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
      const llmConfigs = await window.electronStore.getLLMConfigs();
      const defaultLLMName = await window.electronStore.getDefaultLLMName();
      const defaultModelConfig = llmConfigs.find(
        (config) => config.modelName === defaultLLMName
      );
      if (!defaultModelConfig) {
        throw new Error(`No model config found for model: ${llmName}`);
      }
      await window.llm.streamingLLMResponse(llmName, defaultModelConfig, [
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
    <div className="flex flex-col w-full h-full mx-auto border shadow-lg overflow-hidden bg-gray-700">
      <div className="flex w-full items-center border-t-0 border-r-0 border-l-0 border-solid border-b-[1px] border-gray-600">
        <div className="flex-grow flex justify-center items-center m-0 mt-1 ml-2 mb-1 p-0">
          {defaultModel ? (
            <p className="m-0 p-0 text-gray-500">{defaultModel}</p>
          ) : (
            <p className="m-0 p-0 text-gray-500">No default model selected</p>
          )}
        </div>
        <div className="pr-2 pt-1 cursor-pointer" onClick={restartSession}>
          <FiRefreshCw className="text-gray-300" /> {/* Icon */}
        </div>
      </div>
      <div className="flex flex-col overflow-auto p-3 pt-0 bg-transparent h-full">
        <div className="space-y-2 mt-4 flex-grow">
          {messages.map((message, index) => (
            <ReactMarkdown
              key={index}
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
              className={`p-1 pl-1 markdown-content rounded-lg break-words ${
                currentBotMessage.messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              } `}
            >
              {currentBotMessage.content}
            </ReactMarkdown>
          )}
        </div>
        {userTextFieldInput === "" &&
        askText === AskOptions.AskFile &&
        messages.length == 0 ? (
          <>
            {PROMPT_OPTIONS.map((option, index) => {
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
            {/** if user has written something already, dont bother prompting with template */}
          </>
        ) : undefined}
      </div>
      <div className="p-3 bg-gray-500">
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
              backgroundColor: "rgb(55 65 81 / var(--tw-bg-opacity))",
              color: "rgb(209 213 219)",
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
                  active:shadow-none bg-slate-700 border-none h-full hover:bg-slate-900 cursor-pointer text-center 
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
                  active:shadow-none bg-slate-700 border-none h-full hover:bg-slate-900 cursor-pointer text-center 
                  pt-0 pb-0 pr-2 pl-2`}
                      type="button"
                    >
                      <div className="mb-1">⌄</div>
                    </button>
                  </MenuHandler>
                  <MenuList placeholder="" className="bg-slate-600">
                    {ASK_OPTIONS.map((option, index) => {
                      return (
                        <MenuItem
                          key={index}
                          placeholder=""
                          className="bg-slate-600 border-none h-full w-full hover:bg-slate-700 cursor-pointer text-white text-left p-2"
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
