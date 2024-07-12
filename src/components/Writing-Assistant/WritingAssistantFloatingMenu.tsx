import React, { useState, useEffect, useRef } from "react";

import { MessageStreamEvent } from "@anthropic-ai/sdk/resources";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Editor } from "@tiptap/react";
import { ChatCompletionChunk } from "openai/resources/chat/completions";
import { FaMagic } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { ChatHistory } from "../Chat/Chat";
import { formatOpenAIMessageContentIntoString } from "../Chat/chatUtils";
import { useOutsideClick } from "../Chat/hooks/use-outside-click";
import { HighlightData } from "../Editor/HighlightExtension";
interface WritingAssistantProps {
  editor: Editor | null;
  highlightData: HighlightData;
  currentChatHistory: ChatHistory | undefined;
  setCurrentChatHistory: React.Dispatch<
    React.SetStateAction<ChatHistory | undefined>
  >;
}

const WritingAssistant: React.FC<WritingAssistantProps> = ({
  editor,
  highlightData,
  currentChatHistory,
  setCurrentChatHistory,
}) => {
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isOptionsVisible, setIsOptionsVisible] = useState<boolean>(false);
  const [prevPrompt, setPrevPrompt] = useState<string>("");
  const markdownContainerRef = useRef(null);
  const optionsContainerRef = useRef(null);
  const hasValidMessages = currentChatHistory?.displayableChatHistory.some(
    (msg) => msg.role === "assistant"
  );
  const lastAssistantMessage = currentChatHistory?.displayableChatHistory
    .filter((msg) => msg.role === "assistant")
    .pop();

  useOutsideClick(markdownContainerRef, () => {
    setCurrentChatHistory(undefined);
  });
  useOutsideClick(optionsContainerRef, () => {
    setIsOptionsVisible(false);
  });

  useEffect(() => {
    if (hasValidMessages) {
      setIsOptionsVisible(false);
    }
  }, [hasValidMessages]);

  const copyToClipboard = () => {
    if (
      !editor ||
      !currentChatHistory ||
      currentChatHistory.displayableChatHistory.length === 0
    ) {
      console.error("No chat history available for copying.");
      return;
    }
    const llmResponse =
      currentChatHistory.displayableChatHistory[
        currentChatHistory.displayableChatHistory.length - 1
      ];

    const copiedText = llmResponse.visibleContent
      ? llmResponse.visibleContent
      : formatOpenAIMessageContentIntoString(llmResponse.content);

    navigator.clipboard
      .writeText(copiedText)
      .then(() => {
        console.log("Text copied to clipboard successfully!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const insertAfterHighlightedText = () => {
    if (
      !editor ||
      !currentChatHistory ||
      currentChatHistory.displayableChatHistory.length === 0
    ) {
      console.error("No chat history available for insertion.");
      return;
    }

    const llmResponse =
      currentChatHistory.displayableChatHistory[
        currentChatHistory.displayableChatHistory.length - 1
      ];

    const insertionText = llmResponse.visibleContent
      ? llmResponse.visibleContent
      : formatOpenAIMessageContentIntoString(llmResponse.content);

    editor.view.focus();

    const { from, to } = editor.state.selection;
    const endOfSelection = Math.max(from, to);

    editor
      .chain()
      .focus()
      .setTextSelection(endOfSelection)
      .insertContent("\n" + insertionText)
      .run();
  };

  const replaceHighlightedText = () => {
    if (
      !editor ||
      !currentChatHistory ||
      currentChatHistory.displayableChatHistory.length === 0
    ) {
      console.error("No chat history available for replacement.");
      return;
    }

    const llmResponse =
      currentChatHistory.displayableChatHistory[
        currentChatHistory.displayableChatHistory.length - 1
      ];

    const replacementText = llmResponse.visibleContent
      ? llmResponse.visibleContent
      : formatOpenAIMessageContentIntoString(llmResponse.content);

    editor
      .chain()
      .focus()
      .deleteSelection()
      .insertContent(replacementText)
      .run();
  };

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
    }
    setPrevPrompt(prompt);
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
          zIndex: 50,
        }}
        className="absolute w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600 border-none shadow-md hover:bg-gray-300"
        aria-label="Writing Assistant button"
        onClick={() => setIsOptionsVisible(true)}
      >
        <FaMagic />
      </button>
      {!hasValidMessages && isOptionsVisible && (
        <div
          ref={optionsContainerRef}
          style={{
            top: highlightData.position.top,
            left: highlightData.position.left,
          }}
          className="absolute bg-white border border-gray-300 p-2.5 z-50 w-96 rounded-md"
        >
          <TextField
            type="text"
            variant="outlined"
            size="small"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask AI anything..."
            className="mb-2.5 p-1 w-full" // TailwindCSS classes for styling
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleOption("custom", customPrompt);
              }
            }}
          />
          <div className="max-h-36 overflow-y-auto">
            <Button
              onClick={() => handleOption("simplify")}
              className="block w-full mb-1"
              style={{ textTransform: "none" }}
            >
              Simplify and condense the writing
            </Button>
            <Button
              onClick={() => handleOption("copy-editor")}
              className="block w-full mb-1"
              style={{ textTransform: "none" }}
            >
              Fix spelling and grammar
            </Button>
            <Button
              onClick={() => handleOption("takeaways")}
              className="block w-full mb-1"
              style={{ textTransform: "none" }}
            >
              List key Takeaways
            </Button>
          </div>
        </div>
      )}
      {hasValidMessages && (
        <div
          ref={markdownContainerRef}
          className="absolute bg-white border border-gray-300 rounded-lg shadow-md p-2.5 z-50"
          style={{
            top: highlightData.position.top,
            left: highlightData.position.left,
            width: "385px",
          }}
        >
          {lastAssistantMessage && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              className={`p-1 markdown-content break-words rounded-md ${
                lastAssistantMessage.messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : lastAssistantMessage.role === "assistant"
                  ? "bg-neutral-200 text-black"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {lastAssistantMessage.visibleContent
                ? lastAssistantMessage.visibleContent
                : formatOpenAIMessageContentIntoString(
                    lastAssistantMessage.content
                  )}
            </ReactMarkdown>
          )}
          <div className="flex justify-between mt-2">
            <button
              className="bg-blue-100 border-0 py-1 px-2.5 rounded-md cursor-pointer flex items-center mr-1"
              onClick={() => {
                getLLMResponse(prevPrompt, currentChatHistory);
              }}
            >
              Re-run
            </button>
            <button
              className="bg-blue-100 border-0 py-1 px-2.5 rounded-md cursor-pointer flex items-center mr-1"
              onClick={() => {
                insertAfterHighlightedText();
              }}
            >
              Insert
            </button>
            <button
              className="bg-blue-100 border-0 py-1 px-2.5 rounded-md cursor-pointer flex items-center mr-1"
              onClick={() => {
                copyToClipboard();
              }}
            >
              Copy
            </button>
            <button
              className="bg-indigo-700 text-white border-0 py-1 px-2.5 rounded-md cursor-pointer flex items-center"
              onClick={() => {
                replaceHighlightedText();
              }}
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingAssistant;
