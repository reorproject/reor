import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { ChatbotMessage } from "electron/main/llm/Types";
import { errorToString } from "@/functions/error";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import { FiRefreshCw } from "react-icons/fi"; // Importing refresh icon from React Icons

const ChatWithLLM: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("");

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

    const augmentedPrompt = await window.database.augmentPromptWithRAG(
      userInput,
      currentSessionId
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
      <div className="flex w-full items-center">
        <div className="flex-grow flex justify-center items-center m-0 mt-1 ml-2 mb-1 p-0">
          {defaultModel ? (
            <p className="m-0 p-0 text-gray-500">{defaultModel}</p>
          ) : (
            <p className="m-0 p-0 text-gray-500">No default model selected</p>
          )}
        </div>
        <div className="pr-2 pt-1 cursor-pointer" onClick={restartSession}>
          <FiRefreshCw className="text-white" /> {/* Icon */}
        </div>
      </div>
      <div className="flex flex-col overflow-auto p-4 pt-0 bg-transparent h-full">
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
              <Button
                className="bg-slate-700 w-[70px] border-none h-full hover:bg-slate-900 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2"
                onClick={handleSubmitNewMessage}
                placeholder=""
              >
                Ask
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithLLM;
