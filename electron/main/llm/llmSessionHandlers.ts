import { MessageStreamEvent } from "@anthropic-ai/sdk/resources";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import Store from "electron-store";
import { ProgressResponse } from "ollama";
import { ChatCompletionChunk } from "openai/resources/chat/completions";

import { createPromptWithContextLimitFromContent } from "../Prompts/Prompts";
import { LLMConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";

import {
  sliceListOfStringsToContextLength,
  sliceStringToContextLength,
} from "./contextLimit";
import {
  addOrUpdateLLMSchemaInStore,
  removeLLM,
  getAllLLMConfigs,
  getLLMConfig,
} from "./llmConfig";
import { AnthropicModelSessionService } from "./models/Anthropic";
import { OllamaService } from "./models/Ollama";
import { OpenAIModelSessionService } from "./models/OpenAI";
import { LLMSessionService } from "./Types";

import { ChatHistory } from "@/components/Chat/Chat";

enum LLMType {
  OpenAI = "openai",
  Anthropic = "anthropic",
}

export const LLMSessions: { [sessionId: string]: LLMSessionService } = {};

export const openAISession = new OpenAIModelSessionService();
export const anthropicSession = new AnthropicModelSessionService();

export const ollamaService = new OllamaService();

// This function takes a ChatMessageToDisplay object and returns a ChatCompletionMessageParam

export const registerLLMSessionHandlers = (store: Store<StoreSchema>) => {
  ipcMain.handle(
    "streaming-llm-response",
    async (
      event: IpcMainInvokeEvent,
      llmName: string,
      llmConfig: LLMConfig,
      isJSONMode: boolean,
      chatHistory: ChatHistory
    ): Promise<void> => {
      const handleOpenAIChunk = (chunk: ChatCompletionChunk) => {
        event.sender.send("openAITokenStream", chatHistory.id, chunk);
      };

      const handleAnthropicChunk = (chunk: MessageStreamEvent) => {
        event.sender.send("anthropicTokenStream", chatHistory.id, chunk);
      };

      switch (llmConfig.type) {
        case LLMType.OpenAI:
          await openAISession.streamingResponse(
            llmName,
            llmConfig,
            isJSONMode,
            chatHistory.displayableChatHistory,
            handleOpenAIChunk,
            store.get(StoreKeys.LLMGenerationParameters)
          );
          break;
        case LLMType.Anthropic:
          await anthropicSession.streamingResponse(
            llmName,
            llmConfig,
            isJSONMode,
            chatHistory.displayableChatHistory,
            handleAnthropicChunk,
            store.get(StoreKeys.LLMGenerationParameters)
          );
          break;
        default:
          throw new Error(`LLM type ${llmConfig.type} not supported.`);
      }
    }
  );

  ipcMain.handle("writing-assistant", async (event, llmName, text, mode) => {
    const llmSession = openAISession;
    const llmConfig = await getLLMConfig(store, ollamaService, llmName);
    if (!llmConfig) {
      throw new Error(`LLM ${llmName} not configured.`);
    }

    let promptText;
    switch (mode) {
      case "copy-editor":
        promptText = `Act as a copy editor. Go through the text in triple quotes below. Edit it for spelling mistakes, grammar issues, punctuation, and generally for readability and flow. Format the text into appropriately sized paragraphs. Make your best effort.
 
""" ${text} """
Return only the edited text. Do not wrap your response in quotes. Do not offer anything else other than the edited text in the response. Do not translate the text. If in doubt, or you can't make edits, just return the original text.`;
        break;
      case "simplify":
        promptText = `The following text in triple quotes below has already been written:
"""
${text}
"""
Simplify and condense the writing. Do not return anything other than the simplified writing. Do not wrap responses in quotes.`;
        break;
      case "takeaways":
        promptText = `My notes are below in triple quotes:
""" ${text} """
Write a markdown list (using dashes) of key takeaways from my notes. Write at least 3 items, but write more if the text requires it. Be very detailed and don't leave any information out. Do not wrap responses in quotes.`;
        break;
      default:
        promptText = `Please process the following text:
"""
${text}
"""`;
        break;
    }

    const { prompt: promptToCreate } = createPromptWithContextLimitFromContent(
      text,
      "",
      promptText,
      llmSession.getTokenizer(llmName),
      llmConfig.contextLength
    );

    const llmGeneratedResponse = await llmSession.response(
      llmName,
      llmConfig,
      [
        {
          role: "user",
          content: promptToCreate,
        },
      ],
      false,
      store.get(StoreKeys.LLMGenerationParameters)
    );

    return llmGeneratedResponse.choices[0].message.content || "";
  });

  ipcMain.handle("set-default-llm", (event, modelName: string) => {
    // TODO: validate that the model exists
    store.set(StoreKeys.DefaultLLM, modelName);
  });

  ipcMain.handle("get-default-llm-name", () => {
    return store.get(StoreKeys.DefaultLLM);
  });

  ipcMain.handle("pull-ollama-model", async (event, modelName: string) => {
    const handleProgress = (progress: ProgressResponse) => {
      event.sender.send("ollamaDownloadProgress", modelName, progress);
    };
    await ollamaService.pullModel(modelName, handleProgress);
  });

  ipcMain.handle("get-llm-configs", async () => {
    return await getAllLLMConfigs(store, ollamaService);
  });

  ipcMain.handle("add-or-update-llm", async (event, modelConfig: LLMConfig) => {
    console.log("setting up new local model", modelConfig);
    await addOrUpdateLLMSchemaInStore(store, modelConfig);
  });

  ipcMain.handle("remove-llm", async (event, modelNameToDelete: string) => {
    console.log("deleting local model", modelNameToDelete);
    await removeLLM(store, ollamaService, modelNameToDelete);
  });

  ipcMain.handle(
    "slice-list-of-strings-to-context-length",
    async (event, strings: string[], llmName: string): Promise<string[]> => {
      const llmSession = openAISession;
      const llmConfig = await getLLMConfig(store, ollamaService, llmName);
      console.log("llmConfig", llmConfig);
      if (!llmConfig) {
        throw new Error(`LLM ${llmName} not configured.`);
      }

      return sliceListOfStringsToContextLength(
        strings,
        llmSession.getTokenizer(llmName),
        llmConfig.contextLength
      );
    }
  );

  ipcMain.handle(
    "slice-string-to-context-length",
    async (event, inputString: string, llmName: string): Promise<string> => {
      const llmSession = openAISession;
      const llmConfig = await getLLMConfig(store, ollamaService, llmName);
      console.log("llmConfig", llmConfig);
      if (!llmConfig) {
        throw new Error(`LLM ${llmName} not configured.`);
      }

      return sliceStringToContextLength(
        inputString,
        llmSession.getTokenizer(llmName),
        llmConfig.contextLength
      );
    }
  );
};
