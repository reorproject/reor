import React, { useState, useEffect } from "react";
// import 'your-tailwind-styles.css'; // Replace with your actual Tailwind CSS import

const LLM: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [helloString, setHelloString] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<string>("");

  useEffect(() => {
    const updateStream = (event: string) => {
      setStream((prevStream) => `${prevStream}${event}`);
    };

    window.ipcRenderer.receive("tokenStream", updateStream);

    return () => {
      window.ipcRenderer.removeListener("tokenStream", updateStream);
    };
  }, []); // Empty array as no dependencies are expected to change

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

  const fetchHelloString = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const result = await window.llm.getHello(sessionId);
      setHelloString(result);
    } catch (error) {
      console.error("Failed to fetch hello string:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeStreamingResponse = (prompt: string) => {
    if (!sessionId) return;
    try {
      window.llm.initializeStreamingResponse(sessionId, prompt);
    } catch (error) {
      console.error("Failed to initialize streaming response:", error);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {sessionId && <p>Session ID: {sessionId}</p>}
      {helloString && <p>Hello String: {helloString}</p>}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={initializeSession}
        disabled={loading}
      >
        Initialize Session
      </button>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
        onClick={fetchHelloString}
        disabled={!sessionId || loading}
      >
        Fetch Hello String
      </button>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
        onClick={() => initializeStreamingResponse("fuck you")}
        disabled={!sessionId || loading}
      >
        Get stream baby
      </button>
      <pre>{stream}</pre>
    </div>
  );
};

export default LLM;
