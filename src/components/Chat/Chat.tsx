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

  // useEffect(() => {
  //   if (currentBotMessage) {
  //     // Only update the messages array when a new user message is sent
  //     setMessages((prevMessages) => [
  //       ...prevMessages,
  //       { sender: "bot", text: currentBotMessage },
  //     ]);
  //   }
  // }, [userInput]); // Depend on userInput, not on currentBotMessage

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
    <div className="chat-container">
      {loading && <p>Loading...</p>}
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
        {currentBotMessage && (
          <div className="message bot">{currentBotMessage}</div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={userInput}
          onChange={handleUserInput}
          className="input"
          placeholder="Type your message..."
          disabled={!sessionId || loading}
        />
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!sessionId || loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWithLLM;
