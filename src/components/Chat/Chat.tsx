/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import {
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { errorToString } from "@/functions/error";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/material/CircularProgress";
import ReactMarkdown from "react-markdown";
import { PromptSuggestion } from "./Chat-Prompts";
import {
  ChatCompletionChunk,
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { DBQueryResult } from "electron/main/database/Schema";
import ChatInput from "./ChatInput";

// convert ask options to enum
enum AskOptions {
  Ask = "Ask",
  // AskFile = "Ask File",
  // TemporalAsk = "Temporal Ask",
  // FlashcardAsk = "Flashcard Ask",
}
const ASK_OPTIONS = Object.values(AskOptions);

const EXAMPLE_PROMPTS: { [key: string]: string[] } = {
  [AskOptions.Ask]: [],
  // [AskOptions.AskFile]: [
  //   "Summarize this file",
  //   "What are the key points in this file?",
  // ],
  // [AskOptions.TemporalAsk]: [
  //   "Summarize what I have worked on today",
  //   "Which tasks have I completed this past week?",
  // ],
  // [AskOptions.FlashcardAsk]: [
  //   "Create some flashcards based on the current note",
  // ],
};

export type ChatHistory = {
  id: string;
  // openAIChatHistory: ChatCompletionMessageParam[];
  displayableChatHistory: ChatMessageToDisplay[];
};
export type ChatMessageToDisplay = ChatCompletionMessageParam & {
  messageType: "success" | "error";
  context: DBQueryResult[];
  visibleContent?: string;
};

function formatMessageContent(
  content: string | ChatCompletionContentPart[] | null | undefined
): string | undefined {
  if (Array.isArray(content)) {
    return content.reduce((acc, part) => {
      if (part.type === "text") {
        return acc + part.text; // Concatenate text parts
      }
      return acc; // Skip image parts
    }, "");
  }
  return content || undefined;
}

interface ChatProperties {
  [key: string]: string; // Values must be strings
}

export type ChatTemplate = {
  messageHistory: ChatCompletionMessageParam[];
  properties: ChatProperties;
};

function replaceContentInMessages(
  messages: ChatMessageToDisplay[],
  context: ChatProperties
): ChatMessageToDisplay[] {
  return messages.map((message) => {
    if ("content" in message) {
      if (typeof message.content === "string") {
        message.content = message.content.replace(
          /\{(\w+)\}/g,
          (match, key) => {
            return key in context ? context[key] : match;
          }
        );
      }
    }
    return message;
  });
}

const ragPromptTemplate: ChatCompletionMessageParam[] = [
  {
    content:
      "You are an advanced question answer agent answering questions based on provided context.",
    role: "system",
  },
  {
    content: `
Context:
{context}

Query:
{query}`,
    role: "user",
  },
];

export const resolveRAGContext = async (
  query: string,
  limit: number
): Promise<ChatMessageToDisplay> => {
  // I mean like the only real places to get context from are like particular files or semantic search or full text search.
  // and like it could be like that if a file is here
  const results = await window.database.search(query, limit);

  // maybe for now, we don't need to do any kinds of serious slicing...We can just let users deal with errors themselves based on the limits
  // return results, results.map(dbItem => dbItem.content)
  //  return both results and results.content concatenated:
  return {
    messageType: "success",
    role: "user",
    context: results,
    content: `Based on the following context answer the question down below. \n\n\nContext: \n${results
      .map((dbItem) => dbItem.content)
      .join("\n\n")}\n\n\nQuery:\n${query}`,
    visibleContent: query,
  };
};

interface ChatWithLLMProps {
  // currentFilePath: string | null;
  // openFileByPath: (path: string) => Promise<void>;
  setAllChatHistories: React.Dispatch<React.SetStateAction<ChatHistory[]>>;
  currentChatHistory: ChatHistory | undefined;
  setCurrentChatHistory: React.Dispatch<
    React.SetStateAction<ChatHistory | undefined>
  >;
}

const ChatWithLLM: React.FC<ChatWithLLMProps> = ({
  setAllChatHistories,
  currentChatHistory,
  setCurrentChatHistory,
}) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>("");
  const [askText, setAskText] = useState<AskOptions>(AskOptions.Ask);
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);

  const handleSubmitNewMessage = async (
    chatHistory: ChatHistory | undefined
  ) => {
    try {
      if (loadingResponse) return;
      if (!userTextFieldInput.trim()) return;
      const defaultLLMName = await window.llm.getDefaultLLMName();

      if (!chatHistory || !chatHistory.id) {
        const chatID = Date.now().toString();
        chatHistory = {
          id: chatID,
          displayableChatHistory: [],
        };
      }

      if (chatHistory.displayableChatHistory.length === 0) {
        chatHistory.displayableChatHistory.push(
          await resolveRAGContext(userTextFieldInput, 10)
        );
      } else {
        chatHistory.displayableChatHistory.push({
          role: "user",
          content: userTextFieldInput,
          messageType: "success",
          context: [],
        });
      }

      setUserTextFieldInput("");

      // oh this is literally just for making the chat history appear in the sidebar
      setCurrentChatHistory(chatHistory);

      setAllChatHistories((prev) => {
        if (!chatHistory) return prev;
        if (prev?.find((chat) => chat.id === chatHistory?.id)) {
          return prev;
        }
        const newChatHistories = prev ? [...prev, chatHistory] : [chatHistory];
        return newChatHistories;
      });

      if (!chatHistory) return;

      await window.electronStore.updateChatHistory(chatHistory);

      const llmConfigs = await window.llm.getLLMConfigs();

      const currentModelConfig = llmConfigs.find(
        (config) => config.modelName === defaultLLMName
      );
      if (!currentModelConfig) {
        throw new Error(`No model config found for model: ${defaultLLMName}`);
      }

      await window.llm.streamingLLMResponse(
        defaultLLMName,
        currentModelConfig,
        false,
        chatHistory?.displayableChatHistory
      );
      // once finish streaming, save the message?
    } catch (error) {
      appendNewContentToMessageHistory(errorToString(error), "error");
    }
    // so here we could save the chat history
    setLoadingResponse(false);
  };

  const appendNewContentToMessageHistory = (
    newContent: string,
    newMessageType: "success" | "error"
  ) => {
    setCurrentChatHistory((prev) => {
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
    const handleChunk = async (chunk: ChatCompletionChunk) => {
      const newContent = chunk.choices[0].delta.content ?? "";
      if (newContent) {
        appendNewContentToMessageHistory(newContent, "success");
      }
    };

    const removeTokenStreamListener = window.ipcRenderer.receive(
      "tokenStream",
      handleChunk
    );

    return () => {
      removeTokenStreamListener();
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col w-full h-full mx-auto overflow-hidden bg-neutral-800 border-l-[0.001px] border-b-0 border-t-0 border-r-0 border-neutral-700 border-solid">
        <div className="flex w-full items-center">
          {/* <div className="flex-grow flex justify-center items-center m-0 mt-1 ml-2 mb-1 p-0">
            {defaultModel ? (
              <p className="m-0 p-0 text-gray-500">{defaultModel}</p>
            ) : (
              <p className="m-0 p-0 text-gray-500">No default model selected</p>
            )}
          </div> */}
          {/* <div className="pr-2 pt-1 cursor-pointer" onClick={fetchDefaultModel}>
            <FiRefreshCw className="text-gray-300" title="Restart Session" />{" "}
          </div> */}
        </div>
        <div className="flex flex-col overflow-auto p-3 pt-0 bg-transparent h-full">
          <div className="space-y-2 mt-4 flex-grow">
            {currentChatHistory?.displayableChatHistory.map(
              (message, index) => (
                <ReactMarkdown
                  key={index}
                  rehypePlugins={[rehypeRaw]}
                  className={`p-1 pl-1 markdown-content rounded-lg break-words ${
                    message.messageType === "error"
                      ? "bg-red-100 text-red-800"
                      : message.role === "assistant"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  } `}
                >
                  {message.visibleContent
                    ? message.visibleContent
                    : formatMessageContent(message.content)}
                </ReactMarkdown>
              )
            )}
            {/* {currentVisibleStreamingAssistantMessage && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              className={`p-1 pl-1 markdown-content rounded-lg break-words ${
                currentVisibleStreamingAssistantMessage.messageType === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              } `}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                a: ({ node, ...props }) => (
                  <CustomLinkMarkdown
                    props={props}
                    openFileByPath={openFileByPath}
                  />
                ),
              }}
            >
              {currentVisibleStreamingAssistantMessage.content}
            </ReactMarkdown>
          )} */}
          </div>
          {userTextFieldInput === "" &&
          currentChatHistory?.displayableChatHistory.length == 0 ? (
            <>
              {EXAMPLE_PROMPTS[askText].map((option, index) => {
                return (
                  <PromptSuggestion
                    key={index}
                    promptText={option}
                    onClick={() => {
                      setUserTextFieldInput(option);
                    }}
                  />
                );
              })}
            </>
          ) : undefined}
        </div>

        <ChatInput
          userTextFieldInput={userTextFieldInput}
          setUserTextFieldInput={setUserTextFieldInput}
          handleSubmitNewMessage={() =>
            handleSubmitNewMessage(currentChatHistory)
          }
          loadingResponse={loadingResponse}
          askText={askText}
        />
      </div>
    </div>
  );
};

export default ChatWithLLM;
