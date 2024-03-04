import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { ChatbotMessage } from "electron/main/llm/Types";
import { errorToString } from "@/functions/error";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import { FiRefreshCw } from "react-icons/fi"; // Importing refresh icon from React Icons
import { ChatPrompt } from "./Chat-Prompts";

// convert ask options to enum
enum AskOptions {
  Ask = "Ask",
  AskFile = "Ask file",
}
const ASK_OPTIONS = Object.values(AskOptions);

const PROMPT_OPTIONS = ["Generate weekly 1-1 talking points from this file"]; // more options to come

interface ChatWithLLMProps {
  currentFilePath: string | null;
}

const ChatWithLLM: React.FC<ChatWithLLMProps> = ({ currentFilePath }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [askText, setAskText] = useState<string>("Ask");

  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);

  const [currentBotMessage, setCurrentBotMessage] =
    useState<ChatbotMessage | null>(null);
  const fetchDefaultModel = async () => {
    const defaultModelName = await window.electronStore.getDefaultLLM();
    setDefaultModel(defaultModelName);
  };
  useEffect(() => {
    fetchDefaultModel();
  }, []);

  const initializeSession = async (): Promise<string> => {
    try {
      const sessionID = "some_unique_session_id";
      const sessionExists = await window.llm.doesSessionExist(sessionID);
      if (sessionExists) {
        await window.llm.deleteSession(sessionID);
      }
      console.log("Creating a new session...");
      const newSessionId = await window.llm.createSession(
        "some_unique_session_id"
      );
      console.log("Created a new session with id:", newSessionId);
      setSessionId(newSessionId);

      return newSessionId;
    } catch (error) {
      console.error("Failed to create a new session:", error);
      setCurrentBotMessage({
        messageType: "error",
        content: errorToString(error),
        role: "assistant",
      });
      return "";
    }
  };

  const handleSubmitNewMessage = async () => {
    if (loadingResponse) return;
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await initializeSession();
    }
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
    if (!currentSessionId || !userInput.trim()) return;

    let filterString = "";
    if (askText === AskOptions.AskFile) {
      const databaseFields = await window.database.getDatabaseFields();
      filterString = `${databaseFields.NOTE_PATH} = '${currentFilePath}'`; // undefined current file will let the model deal with no context
    }

    const augmentedPrompt = await window.database.augmentPromptWithRAG(
      userInput,
      currentSessionId,
      filterString
    );
    startStreamingResponse(currentSessionId, augmentedPrompt, true);

    setMessages([
      ...newMessages,
      { role: "user", messageType: "success", content: userInput },
    ]);
    setUserInput("");
  };

  useEffect(() => {
    if (sessionId) {
      const updateStream = (newMessage: ChatbotMessage) => {
        setCurrentBotMessage((prev) => {
          return {
            role: "assistant",
            messageType: newMessage.messageType,
            content: prev?.content
              ? prev.content + newMessage.content
              : newMessage.content,
          };
        });
      };

      window.ipcRenderer.receive("tokenStream", updateStream);

      return () => {
        window.ipcRenderer.removeListener("tokenStream", updateStream);
      };
    }
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (sessionId) {
        console.log("Deleting session:", sessionId);
        window.llm.deleteSession(sessionId);
      }
      console.log("Component is unmounted (hidden)");
    };
  }, [sessionId]);

  const restartSession = async () => {
    if (sessionId) {
      console.log("Deleting session:", sessionId);
      await window.llm.deleteSession(sessionId);
    }
    const newSessionId = await initializeSession();
    setSessionId(newSessionId);
    fetchDefaultModel();
  };

  const startStreamingResponse = async (
    sessionId: string,
    prompt: string,
    ignoreChatHistory?: boolean
  ) => {
    try {
      console.log("Initializing streaming response...");
      setLoadingResponse(true);
      await window.llm.initializeStreamingResponse(
        sessionId,
        prompt,
        ignoreChatHistory
      );
      console.log("Initialized streaming response");
      setLoadingResponse(false);
    } catch (error) {
      setLoadingResponse(false);

      console.error("Failed to initialize streaming response:", error);
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
    setUserInput(e.target.value);
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
        {/* {messages.length === 0 && !currentBotMessage && (
          <div>
            {defaultModel ? (
              <p className="text-center text-gray-500">
                Using default model: {defaultModel}
              </p>
            ) : (
              <p className="text-center text-gray-500">
                No default model selected
              </p>
            )}
          </div>
        )} */}
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
        {userInput === "" && askText === AskOptions.AskFile ? (
          <>
            {PROMPT_OPTIONS.map((option, index) => {
              return (
                <ChatPrompt
                  key={index}
                  promptText={option}
                  onClick={() => {
                    console.log(option);
                    setUserInput(option);
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
            value={userInput}
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
                          className="bg-slate-600 border-none h-full w-full hover:bg-slate-700 cursor-pointer text-white text-left"
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
