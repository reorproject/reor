import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { ChatbotMessage } from "electron/main/llm/Types";
import { errorToString } from "@/functions/error";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/material/CircularProgress";

const ChatWithLLM: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  // const [waitingForFirstToken, setWaitingForFirstToken] =
  //   useState<boolean>(false);

  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);

  const [currentBotMessage, setCurrentBotMessage] =
    useState<ChatbotMessage | null>(null);

  const initializeSession = async () => {
    setLoadingSession(true);
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
    } catch (error) {
      console.error("Failed to create a new session:", error);
      setCurrentBotMessage({
        messageType: "error",
        content: errorToString(error),
        role: "assistant",
      });
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    return () => {
      if (sessionId) {
        window.llm.deleteSession(sessionId);
      }
      console.log("Component is unmounted (hidden)");
    };
  }, [sessionId]);

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
    if (!sessionId || !userInput.trim()) return;

    if (newMessages.length <= 1) {
      const augmentedPrompt = await window.database.augmentPromptWithRAG(
        userInput,
        8
      );
      startStreamingResponse(sessionId, augmentedPrompt);
    } else {
      startStreamingResponse(sessionId, userInput);
    }

    // Add the user's message to the messages
    setMessages([
      ...newMessages,
      { role: "user", messageType: "success", content: userInput },
    ]);
    setUserInput("");
  };

  useEffect(() => {
    if (!sessionId) {
      initializeSession();

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

  const startStreamingResponse = async (sessionId: string, prompt: string) => {
    try {
      console.log("Initializing streaming response...");
      setLoadingResponse(true);
      await window.llm.initializeStreamingResponse(sessionId, prompt);
      console.log("Initialized streaming response");
      setLoadingResponse(false);
      // setWaitingForFirstToken(true);
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
      e.preventDefault(); // Prevents default action (new line) when pressing Enter
      handleSubmitNewMessage();
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setUserInput(e.target.value);
  };

  return (
    <div className="flex flex-col w-full h-full mx-auto border shadow-lg overflow-hidden bg-white">
      <div className="flex-1 overflow-auto p-4 bg-transparent">
        {loadingSession && (
          <p className="text-center text-gray-500">Loading...</p>
        )}
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : message.role === "assistant"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              } break-words`}
            >
              {message.content}
            </div>
          ))}
          {currentBotMessage?.messageType === "success" && (
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800 break-words">
              {currentBotMessage.content}
            </div>
          )}
          {currentBotMessage?.messageType === "error" && (
            <div className="p-2 rounded-lg bg-red-100 text-red-800 break-words">
              {currentBotMessage.content}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-100">
        <div className="flex space-x-2 h-[38px]">
          <Textarea
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            value={userInput}
            className="w-full h-full " // 'resize-none' to prevent manual resizing
            name="Outlined"
            placeholder="Ask your knowledge..."
            variant="outlined"
          />
          {/* <div className="w-[80px]"> */}
          <div className="flex justify-center items-center h-full ">
            {loadingResponse ? (
              <CircularProgress
                size={32}
                thickness={20}
                style={{ color: "rgb(51 65 85 / var(--tw-bg-opacity))" }}
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
