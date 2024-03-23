import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LLMSessionService } from "./Types";
import { OpenAIModelSessionService } from "./models/OpenAI";
import { LLMConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { OllamaService } from "./models/Ollama";
import {
  addOrUpdateLLMSchemaInStore,
  removeLLM,
  getAllLLMConfigs,
  getLLMConfig,
} from "./llmConfig";
import { ProgressResponse } from "ollama";

export const LLMSessions: { [sessionId: string]: LLMSessionService } = {};

export const openAISession = new OpenAIModelSessionService();

export const ollamaService = new OllamaService();

export const registerLLMSessionHandlers = (store: Store<StoreSchema>) => {
  ipcMain.handle(
    "streaming-llm-response",
    async (
      event: IpcMainInvokeEvent,
      llmName: string,
      llmConfig: LLMConfig,
      messageHistory: ChatCompletionMessageParam[]
    ): Promise<void> => {
      if (llmConfig.type === "local") {
        throw new Error("Local LLMs not yet implemented.");
      }

      const handleChunk = (chunk: ChatCompletionChunk) => {
        event.sender.send("tokenStream", chunk);
      };
      await openAISession.streamingResponse(
        llmName,
        llmConfig,
        messageHistory,
        handleChunk,
        store.get(StoreKeys.LLMGenerationParameters)
      );
    }
  );
  ipcMain.on("set-default-llm", (event, modelName: string) => {
    // TODO: validate that the model exists
    store.set(StoreKeys.DefaultLLM, modelName);
  });

  ipcMain.on("get-default-llm-name", (event) => {
    event.returnValue = store.get(StoreKeys.DefaultLLM);
  });

  ipcMain.handle("pull-ollama-model", async (event, modelName: string) => {
    const handleProgress = (progress: ProgressResponse) => {
      event.sender.send("ollamaDownloadProgress", progress);
    };
    await ollamaService.pullModel(modelName, handleProgress);
  });

  ipcMain.handle("get-llm-configs", async () => {
    return await getAllLLMConfigs(store, ollamaService);
  });

  ipcMain.handle("get-llm-config-by-name", (event, modelName: string) => {
    const llmConfig = getLLMConfig(store, ollamaService, modelName);
    return llmConfig;
  });

  ipcMain.handle("add-or-update-llm", async (event, modelConfig: LLMConfig) => {
    console.log("setting up new local model", modelConfig);
    await addOrUpdateLLMSchemaInStore(store, modelConfig);
  });

  ipcMain.handle("remove-llm", async (event, modelNameToDelete: string) => {
    console.log("deleting local model", modelNameToDelete);
    await removeLLM(store, ollamaService, modelNameToDelete);
  });
};
