import { DBEntry, DBQueryResult } from "electron/main/database/Schema";
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { ChatFilters, ChatHistory, ChatMessageToDisplay } from "./Chat";

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
  context: string;
  query: string;
  [key: string]: string; // Values must be strings
}

export const getChatContextFromChatHistory = (
  chatHistory: ChatHistory | undefined
): DBQueryResult[] => {
  if (!chatHistory) return [];
  const contextForChat = chatHistory.displayableChatHistory
    .map((message) => {
      return message.context;
    })
    .flat();
  return contextForChat as DBQueryResult[];
};

function replaceContentInMessages(
  messages: ChatCompletionMessageParam[],
  chatProperties: ChatProperties
): ChatCompletionMessageParam[] {
  return messages.map((message) => {
    let newMessage = { ...message };
    if ("content" in newMessage) {
      if (typeof newMessage.content === "string") {
        newMessage.content = newMessage.content.replace(
          /\{(\w+)\}/g,
          (match, key) => {
            return key in chatProperties ? chatProperties[key] : match;
          }
        );
      }
    }
    return newMessage;
  });
}

export const ragPromptTemplate: ChatCompletionMessageParam[] = [
  {
    content:
      "You are an advanced question-answer agent answering questions based on provided context. The context is a set of notes from a note-taking app. Respond in Spanish *ONLY*.",
    role: "system",
  },
  {
    content: `
Context:


Query:
{query}`,
    role: "user",
  },
];

const transformChatMessageParamIntoChatMessageToDisplay = (
  message: ChatCompletionMessageParam,
  query: string,
  context: DBEntry[]
): ChatMessageToDisplay => {
  const output: ChatMessageToDisplay = {
    ...message,
    messageType: "success",
    context: context,
    visibleContent: query,
  };

  return output;
};

export const resolveRAGContext = async (
  query: string,
  chatFilters: ChatFilters
): Promise<DBEntry[]> => {
  let contextResults: DBEntry[] = [];
  if (chatFilters.files.length > 0) {
    console.log("chatFilters.files", chatFilters.files);
    contextResults = await window.files.getFilesystemPathsAsDBItems(
      chatFilters.files
    );
  } else {
    contextResults = await window.database.search(
      query,
      chatFilters.numberOfChunksToFetch
    );
  }
  return contextResults;
};

export const generateOverallChatHistory = async (
  query: string,
  chatFilters: ChatFilters,
  promptTemplate: ChatCompletionMessageParam[]
): Promise<ChatMessageToDisplay[]> => {
  const contextResults = await resolveRAGContext(query, chatFilters);
  const chatProperties: ChatProperties = {
    context: concatenateDBItems(contextResults),
    query,
  };

  const ragPrompt = replaceContentInMessages(promptTemplate, chatProperties);
  return ragPrompt.map((message) =>
    transformChatMessageParamIntoChatMessageToDisplay(
      message,
      query,
      contextResults
    )
  );
};

export const concatenateDBItems = (dbItems: DBEntry[]): string => {
  return dbItems.map((dbItem) => dbItem.content).join("\n\n");
};
