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
import { DBEntry, DBQueryResult } from "electron/main/database/Schema";
import ChatInput from "./ChatInput";
import {
  ChatHistoryMetadata,
  getDisplayableChatName,
} from "./hooks/use-chat-history";
import { useDebounce } from "use-debounce";
import { SimilarEntriesComponent } from "../Similarity/SimilarFilesSidebar";
import ResizableComponent from "../Generic/ResizableComponent";
import AddContextFiltersModal from "./AddContextFiltersModal";

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
  context: DBEntry[];
  visibleContent?: string;
};

export interface ChatFilters {
  numberOfChunksToFetch: number;
  files: string[];
}

export function formatOpenAIMessageContentIntoString(
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

// function replaceContentInMessages(
//   messages: ChatMessageToDisplay[],
//   context: ChatProperties
// ): ChatMessageToDisplay[] {
//   return messages.map((message) => {
//     if ("content" in message) {
//       if (typeof message.content === "string") {
//         message.content = message.content.replace(
//           /\{(\w+)\}/g,
//           (match, key) => {
//             return key in context ? context[key] : match;
//           }
//         );
//       }
//     }
//     return message;
//   });
// }

// const ragPromptTemplate: ChatCompletionMessageParam[] = [
//   {
//     content:
//       "You are an advanced question answer agent answering questions based on provided context.",
//     role: "system",
//   },
//   {
//     content: `
// Context:
// {context}

// Query:
// {query}`,
//     role: "user",
//   },
// ];

export const resolveRAGContext = async (
  query: string,
  chatFilters: ChatFilters,
): Promise<ChatMessageToDisplay> => {
  // I mean like the only real places to get context from are like particular files or semantic search or full text search.
  // and like it could be like that if a file is here

  let results: DBEntry[] = [];
  if (chatFilters.files.length > 0) {
    console.log("chatFilters.files", chatFilters.files);
    results = await window.files.getFilesystemPathsAsDBItems(chatFilters.files);
  } else {
    results = await window.database.search(
      query,
      chatFilters.numberOfChunksToFetch
    );
  }
  console.log("results", results)
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
  vaultDirectory: string;
  openFileByPath: (path: string) => Promise<void>;

  setChatHistoriesMetadata: React.Dispatch<
    React.SetStateAction<ChatHistoryMetadata[]>
  >;
  // setAllChatHistories: React.Dispatch<React.SetStateAction<ChatHistory[]>>;
  currentChatHistory: ChatHistory | undefined;
  setCurrentChatHistory: React.Dispatch<
    React.SetStateAction<ChatHistory | undefined>
  >;
  showSimilarFiles: boolean;
  chatFilters: ChatFilters;
  setChatFilters: React.Dispatch<ChatFilters>;
}

const ChatWithLLM: React.FC<ChatWithLLMProps> = ({
  vaultDirectory,
  openFileByPath,
  setChatHistoriesMetadata,
  currentChatHistory,
  setCurrentChatHistory,
  showSimilarFiles,
  chatFilters,
  setChatFilters,
}) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>("");
  const [askText, setAskText] = useState<AskOptions>(AskOptions.Ask);
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [readyToSave, setReadyToSave] = useState<boolean>(false);
  const [currentContext, setCurrentContext] = useState<DBQueryResult[]>([]);
  const [isAddContextFiltersModalOpen, setIsAddContextFiltersModalOpen] = useState<boolean>(false);

  // chat filters related state: this is the only thing that the Chat component cares about
  // chat component doesn't care about previous states and suggestions, and it can reset it
  // RESET when a new chat occurs
  useEffect(() => {
    const context = getChatHistoryContext(currentChatHistory);
    setCurrentContext(context);
  }, [currentChatHistory]);

  // update chat context when files are added
  useEffect(() => {
    const setContextOnFileAdded = async () => {
      if (chatFilters.files.length > 0) {
        const results = await window.files.getFilesystemPathsAsDBItems(chatFilters.files);
        setCurrentContext(results as DBQueryResult[]);
      } else if (!currentChatHistory?.id) {
        // if there is no prior history, set current context to empty
        setCurrentContext([]);
      }
    }
    setContextOnFileAdded();
  }, [chatFilters.files]);

  useEffect(() => {
    if (readyToSave && currentChatHistory) {
      window.electronStore.updateChatHistory(currentChatHistory);
      setReadyToSave(false);
    }
  }, [readyToSave, currentChatHistory]);

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
      console.log(chatFilters)
      if (chatHistory.displayableChatHistory.length === 0) {
        if (chatFilters) {
          // chatHistory.displayableChatHistory.push({
          //   role: "system",
          //   content:
          //     "You are an advanced question answer agent answering questions based on provided context. You will respond to queries in second person: saying things like 'you'. The context provided was written by the same user who is asking the question.",
          //   messageType: "success",

          //   context: [],
          // });
          chatHistory.displayableChatHistory.push(
            await resolveRAGContext(userTextFieldInput, chatFilters)
          );
        }
      } else {
        chatHistory.displayableChatHistory.push({
          role: "user",
          content: userTextFieldInput,
          messageType: "success",
          context: [],
        });
      }
      console.log(chatHistory)

      setUserTextFieldInput("");

      setCurrentChatHistory(chatHistory);
      setChatHistoriesMetadata((prev) => {
        if (!chatHistory) return prev;
        if (prev?.find((chat) => chat.id === chatHistory?.id)) {
          return prev;
        }
        const newChatHistories = prev
          ? [
              ...prev,
              {
                id: chatHistory.id,
                displayName: getDisplayableChatName(chatHistory),
              },
            ]
          : [
              {
                id: chatHistory.id,
                displayName: getDisplayableChatName(chatHistory),
              },
            ];
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
        chatHistory
      );
      setReadyToSave(true);
    } catch (error) {
      if (chatHistory) {
        appendNewContentToMessageHistory(
          chatHistory.id,
          errorToString(error),
          "error"
        );
      }
    }
    // so here we could save the chat history
    setLoadingResponse(false);
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
    const handleChunk = async (
      recievedChatID: string,
      chunk: ChatCompletionChunk
    ) => {
      const newContent = chunk.choices[0].delta.content ?? "";
      if (newContent) {
        appendNewContentToMessageHistory(recievedChatID, newContent, "success");
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
        <div className="flex flex-col overflow-auto p-3 pt-0 bg-transparent h-full">
          <div className="space-y-2 ml-4 mr-4 flex-grow">
            {currentChatHistory?.displayableChatHistory
              .filter((msg) => msg.role !== "system")
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
          {
            (!currentChatHistory || currentChatHistory?.displayableChatHistory.length == 0) && (
              <>
                <div className="flex items-center justify-center text-gray-300 text-sm">
                  Start a conversation with your notes by typing a message below.
                </div>
                <div className="flex items-center justify-center text-gray-300 text-sm">
                  <button className='bg-slate-600 m-2 rounded-lg border-none h-6 w-40 text-center vertical-align text-white '
                      onClick={() => {
                        setIsAddContextFiltersModalOpen(true)
                    }}>
                  {chatFilters.files.length > 0 ? "Update filters" : "Add filters"}
                  </button>
                </div>
              </>
            )
          }
          {isAddContextFiltersModalOpen && <AddContextFiltersModal
              vaultDirectory={vaultDirectory}
              isOpen={isAddContextFiltersModalOpen} onClose={() => setIsAddContextFiltersModalOpen(false)}
              titleText="You can optionally include a file into chat context"
              chatFilters={chatFilters}
              setChatFilters={setChatFilters}
              maxSuggestionWidth="w-[900px]"
            />}
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
      {showSimilarFiles && (
        <SimilarEntriesComponent
          similarEntries={currentContext}
          titleText="Context Used in Chat"
          onFileSelect={openFileByPath}
          saveCurrentFile={() => {
            return Promise.resolve();
          }}
          isLoadingSimilarEntries={false}
          setIsRefined={() => {}} // to allow future toggling
          isRefined={true} // always refined for now
        />
      )}
    </div>
  );
};

const getChatHistoryContext = (
  chatHistory: ChatHistory | undefined
): DBQueryResult[] => {
  if (!chatHistory) return [];
  console.log("chatHistory", chatHistory.displayableChatHistory);

  const contextForChat = chatHistory.displayableChatHistory
    .map((message) => {
      return message.context;
    })
    .flat();
  return contextForChat as DBQueryResult[];
};

export default ChatWithLLM;
