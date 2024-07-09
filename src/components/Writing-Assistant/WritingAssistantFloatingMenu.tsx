import React, { useState, useEffect, useRef } from "react";

import { MessageStreamEvent } from "@anthropic-ai/sdk/resources";
import { ChatCompletionChunk } from "openai/resources/chat/completions";
import { FaMagic } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { ChatHistory } from "../Chat/Chat";
import { formatOpenAIMessageContentIntoString } from "../Chat/chatUtils";
import { useOutsideClick } from "../Chat/hooks/use-outside-click";
import { HighlightData } from "../Editor/HighlightExtension";
interface WritingAssistantProps {
  highlightData: HighlightData;
  currentChatHistory: ChatHistory | undefined;
  setCurrentChatHistory: React.Dispatch<
    React.SetStateAction<ChatHistory | undefined>
  >;
}

const WritingAssistant: React.FC<WritingAssistantProps> = ({
  highlightData,
  currentChatHistory,
  setCurrentChatHistory,
}) => {
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isOptionsVisible, setIsOptionsVisible] = useState<boolean>(false);
  const markdownContainerRef = useRef(null);
  const optionsContainerRef = useRef(null);

  useOutsideClick(markdownContainerRef, () => {
    setCurrentChatHistory(undefined);
  });
  useOutsideClick(optionsContainerRef, () => {
    setIsOptionsVisible(false);
  });
  const appendNewContentToMessageHistory = (
    chatID: string,
    newContent: string,
    newMessageType: "success" | "error"
  ) => {
    setCurrentChatHistory((prev) => {
      if (chatID !== prev?.id) return prev;
      const newDisplayableHistory = prev?.displayableChatHistory || [];
      if (newDisplayableHistory.length > 0) {
        const lastMessage =
          newDisplayableHistory[newDisplayableHistory.length - 1];

        if (lastMessage.role === "assistant") {
          lastMessage.content += newContent; // Append new content with a space
          lastMessage.messageType = newMessageType;
        } else {
          newDisplayableHistory.push({
            role: "assistant",
            content: newContent,
            messageType: newMessageType,
            context: [],
          });
        }
      } else {
        newDisplayableHistory.push({
          role: "assistant",
          content: newContent,
          messageType: newMessageType,
          context: [],
        });
      }
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
    const handleOpenAIChunk = async (
      receivedChatID: string,
      chunk: ChatCompletionChunk
    ) => {
      const newContent = chunk.choices[0].delta.content ?? "";
      if (newContent) {
        appendNewContentToMessageHistory(receivedChatID, newContent, "success");
      }
    };

    const handleAnthropicChunk = async (
      receivedChatID: string,
      chunk: MessageStreamEvent
    ) => {
      const newContent =
        chunk.type === "content_block_delta" ? chunk.delta.text ?? "" : "";
      if (newContent) {
        appendNewContentToMessageHistory(receivedChatID, newContent, "success");
      }
    };

    const removeOpenAITokenStreamListener = window.ipcRenderer.receive(
      "openAITokenStream",
      handleOpenAIChunk
    );

    const removeAnthropicTokenStreamListener = window.ipcRenderer.receive(
      "anthropicTokenStream",
      handleAnthropicChunk
    );

    return () => {
      removeOpenAITokenStreamListener();
      removeAnthropicTokenStreamListener();
    };
  }, []);
  if (!highlightData.position) return null;

  const handleOption = async (option: string, customPromptInput?: string) => {
    const selectedText = highlightData.text;
    if (!selectedText.trim()) return;

    let prompt = "";

    switch (option) {
      case "simplify":
        prompt = `The following text in triple quotes below has already been written:
"""
${selectedText}
"""
Simplify and condense the writing. Do not return anything other than the simplified writing. Do not wrap responses in quotes.`;
        break;
      case "copy-editor":
        prompt = `Act as a copy editor. Go through the text in triple quotes below. Edit it for spelling mistakes, grammar issues, punctuation, and generally for readability and flow. Format the text into appropriately sized paragraphs. Make your best effort.
 
""" ${selectedText} """
Return only the edited text. Do not wrap your response in quotes. Do not offer anything else other than the edited text in the response. Do not translate the text. If in doubt, or you can't make edits, just return the original text.`;
        break;
      case "takeaways":
        prompt = `My notes are below in triple quotes:
""" ${selectedText} """
Write a markdown list (using dashes) of key takeaways from my notes. Write at least 3 items, but write more if the text requires it. Be very detailed and don't leave any information out. Do not wrap responses in quotes.`;
        break;
      case "custom":
        prompt =
          `prompt(in triple #): ` +
            `### ` +
            customPromptInput +
            ` ###` +
            ` ,apply the prompt to the text in triple quotes """ ${selectedText} """` ||
          "default prompt";
        break;
      default:
        prompt = "default prompt";
    }

    await getLLMResponse(prompt, currentChatHistory);
  };

  const getLLMResponse = async (
    prompt: string,
    chatHistory: ChatHistory | undefined
  ) => {
    const defaultLLMName = await window.llm.getDefaultLLMName();
    const llmConfigs = await window.llm.getLLMConfigs();

    const currentModelConfig = llmConfigs.find(
      (config) => config.modelName === defaultLLMName
    );
    if (!currentModelConfig) {
      throw new Error(`No model config found for model: ${defaultLLMName}`);
    }

    try {
      if (loadingResponse) return;
      setLoadingResponse(true);
      if (!chatHistory || !chatHistory.id) {
        const chatID = Date.now().toString();
        chatHistory = {
          id: chatID,
          displayableChatHistory: [],
        };
      }
      setCurrentChatHistory(chatHistory);
      chatHistory.displayableChatHistory.push({
        role: "user",
        content: prompt,
        messageType: "success",
        context: [],
      });
      if (!chatHistory) return;

      await window.llm.streamingLLMResponse(
        defaultLLMName,
        currentModelConfig,
        false,
        chatHistory
      );
    } catch (error) {
      console.error(error);
    }
    setLoadingResponse(false);
  };

  return (
    <div>
      <button
        style={{
          top: `${highlightData.position.top}px`,
          left: `${highlightData.position.left + 30}px`,
          zIndex: 1000,
        }}
        className="absolute w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600 border-none shadow-md hover:bg-gray-300"
        aria-label="Writing Assistant button"
        onClick={() => setIsOptionsVisible(!isOptionsVisible)}
      >
        <FaMagic />
      </button>
      {isOptionsVisible && (
        <div
          ref={optionsContainerRef}
          style={{
            position: "absolute",
            top: highlightData.position.top,
            left: highlightData.position.left,
            background: "white",
            border: "1px solid #ccc",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          <button onClick={() => handleOption("simplify")}>Simplify</button>
          <button onClick={() => handleOption("copy-editor")}>
            Copy Editor
          </button>
          <button onClick={() => handleOption("takeaways")}>
            Key Takeaways
          </button>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom prompt"
            style={{ margin: "10px 0", padding: "5px" }}
          />
          <button onClick={() => handleOption("custom", customPrompt)}>
            Submit Custom Prompt
          </button>
        </div>
      )}
      <div
        ref={markdownContainerRef}
        style={{
          position: "absolute",
          top: highlightData.position.top,
          left: highlightData.position.left,
          // background: "white",
          // border: "1px solid #ccc",
          // padding: "10px",
          zIndex: 1000,
        }}
      >
        {currentChatHistory?.displayableChatHistory
          .filter((msg) => msg.role !== "system" && msg.role !== "user")
          .map((message, index) => (
            <ReactMarkdown
              key={index}
              rehypePlugins={[rehypeRaw]}
              className={`p-1 pl-1 markdown-content rounded-lg break-words ${
                message.messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : message.role === "assistant"
                  ? "bg-neutral-600	text-gray-200"
                  : "bg-blue-100	text-blue-800"
              } `}
            >
              {message.visibleContent
                ? message.visibleContent
                : formatOpenAIMessageContentIntoString(message.content)}
            </ReactMarkdown>
          ))}
      </div>
    </div>
  );
};

export default WritingAssistant;
