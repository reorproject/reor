import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { ChatbotMessage } from "electron/main/llm/Types";

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
    } finally {
      setLoading(false);
    }
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

      // Update the updateStream function to handle the new message structure

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents default action (new line) when pressing Enter
      handleSubmitNewMessage();
    }
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
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask your notes..."
            disabled={!sessionId || loading}
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
