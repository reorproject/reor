import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LLMSessionService } from "./Types";
import { OpenAIModelSessionService } from "./models/OpenAI";
import { LLMConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { ChatCompletionChunk } from "openai/resources/chat/completions";
import { OllamaService } from "./models/Ollama";
import {
  addOrUpdateLLMSchemaInStore,
  removeLLM,
  getAllLLMConfigs,
  getLLMConfig,
} from "./llmConfig";
import { ProgressResponse } from "ollama";
import {
  sliceListOfStringsToContextLength,
  sliceStringToContextLength,
} from "./contextLimit";
import { ChatMessageToDisplay } from "@/components/Chat/Chat";

export const LLMSessions: { [sessionId: string]: LLMSessionService } = {};

export const openAISession = new OpenAIModelSessionService();

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
      messageHistory: ChatMessageToDisplay[]
    ): Promise<void> => {
      const handleChunk = (chunk: ChatCompletionChunk) => {
        event.sender.send("tokenStream", chunk);
      };

      await openAISession.streamingResponse(
        llmName,
        llmConfig,
        isJSONMode,
        messageHistory,
        handleChunk,
        store.get(StoreKeys.LLMGenerationParameters)
      );
    }
  );
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
