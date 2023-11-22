import React, { useState, useEffect } from "react";

const ChatWithLLM: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [currentBotMessage, setCurrentBotMessage] = useState<string>("");

  useEffect(() => {
    initializeSession();
    const updateStream = (event: string) => {
      setCurrentBotMessage((prev) => prev + event);
    };

    window.ipcRenderer.receive("tokenStream", updateStream);

    return () => {
      window.ipcRenderer.removeListener("tokenStream", updateStream);
    };
  }, []);

  const initializeSession = async () => {
    setLoading(true);
    try {
      const newSessionId = await window.llm.createSession(
        "some_unique_session_id"
      );
      setSessionId(newSessionId);
    } catch (error) {
      console.error("Failed to create a new session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = () => {
    const localCurrentBotMessage = currentBotMessage;
    setCurrentBotMessage("");
    if (localCurrentBotMessage) {
      // Only update the messages array when a new user message is sent
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: localCurrentBotMessage },
      ]);
    }
    if (!sessionId || !userInput.trim()) return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userInput },
    ]);
    initializeStreamingResponse(userInput);
    // setCurrentBotMessage(""); // Reset the current bot message here
    setUserInput("");
  };

  const initializeStreamingResponse = (prompt: string) => {
    try {
      window.llm.initializeStreamingResponse(sessionId, prompt);
    } catch (error) {
      console.error("Failed to initialize streaming response:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto border shadow-lg overflow-hidden">
      <div className={`flex-1 overflow-auto p-4 bg-white`}>
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.sender === "bot"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {message.text}
            </div>
          ))}
          {currentBotMessage && (
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              {currentBotMessage}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-100">
        <div className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={handleUserInput}
            className="flex-1 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={!sessionId || loading}
          />
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded shadow hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleSubmit}
            disabled={!sessionId || loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithLLM;
