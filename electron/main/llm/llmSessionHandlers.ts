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
  deleteLLMSchemafromStore,
  getLLMConfig,
} from "../Store/storeHandlers";

export const LLMSessions: { [sessionId: string]: LLMSessionService } = {};

export const openAISession = new OpenAIModelSessionService();

export const ollamaSession = new OllamaService();

console.log("process.resourcesPath: ", process.resourcesPath);

export const registerLLMSessionHandlers = async (store: Store<StoreSchema>) => {
  await ollamaSession.init();
  const ollamaModels = await ollamaSession.getAvailableModels();
  console.log("OLLAMA MODELS: ", ollamaModels);
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
    store.set(StoreKeys.DefaultLLM, modelName);
  });

  ipcMain.on("get-default-llm-name", (event) => {
    event.returnValue = store.get(StoreKeys.DefaultLLM);
  });

  ipcMain.handle("get-llm-configs", () => {
    const aiModelConfigs = store.get(StoreKeys.LLMs);
    return aiModelConfigs || {};
  });

  ipcMain.handle("get-llm-config-by-name", (event, modelName: string) => {
    const llmConfig = getLLMConfig(store, modelName);
    return llmConfig;
  });

  ipcMain.handle("add-or-update-llm", async (event, modelConfig: LLMConfig) => {
    console.log("setting up new local model", modelConfig);
    await addOrUpdateLLMSchemaInStore(store, modelConfig);
  });

  ipcMain.handle(
    "delete-local-llm",
    async (event, modelNameToDelete: string) => {
      console.log("deleting local model", modelNameToDelete);
      return await deleteLLMSchemafromStore(store, modelNameToDelete);
    }
  );
};
