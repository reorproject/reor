import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { ChatbotMessage } from "electron/main/llm/Types";
import { errorToString } from "@/functions/error";
import Textarea from "@mui/joy/Textarea";

const ChatWithLLM: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);

  const [currentBotMessage, setCurrentBotMessage] =
    useState<ChatbotMessage | null>(null);

  const initializeSession = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!sessionId) {
      initializeSession();

      const updateStream = (newMessage: ChatbotMessage) => {
        console.log("Received new message:", newMessage);
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

  const handleSubmitNewMessage = async () => {
    if (currentBotMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          messageType: currentBotMessage.messageType,
          content: currentBotMessage.content,
        },
      ]);
      setCurrentBotMessage({
        messageType: "success",
        content: "",
        role: "assistant",
      });
    }
    if (!sessionId || !userInput.trim()) return;

    if (messages.length <= 1) {
      const augmentedPrompt = await window.database.augmentPromptWithRAG(
        userInput,
        5
      );
      startStreamingResponse(sessionId, augmentedPrompt);
    } else {
      startStreamingResponse(sessionId, userInput);
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", messageType: "success", content: userInput },
    ]);
    setUserInput("");
  };

  const startStreamingResponse = (sessionId: string, prompt: string) => {
    try {
      window.llm.initializeStreamingResponse(sessionId, prompt);
    } catch (error) {
      console.error("Failed to initialize streaming response:", error);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (!e.shiftKey && e.key == "Enter") {
      e.preventDefault(); // Prevents default action (new line) when pressing Enter
      handleSubmitNewMessage();
      setUserInput("");
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
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.role === "assistant"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message.content}
            </div>
          ))}
          {currentBotMessage?.messageType == "success" && (
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800 break-words">
              {currentBotMessage.content}
            </div>
          )}
          {currentBotMessage?.messageType == "error" && (
            <div className="p-2 rounded-lg bg-red-100 text-red-800 break-words">
              {currentBotMessage.content}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-100">
        <div className="flex space-x-2">
          <Textarea
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            value={userInput}
            className="w-full"
            name="Outlined"
            placeholder="Ask your knowledge..."
            variant="outlined"
          />

          <Button
            className="bg-slate-700  border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
            onClick={handleSubmitNewMessage}
            placeholder=""
          >
            Ask
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithLLM;
