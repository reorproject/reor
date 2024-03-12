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

export const LLMSessions: { [sessionId: string]: LLMSessionService } = {};

export const openAISession = new OpenAIModelSessionService();

export const ollamaSession = new OllamaService();
ollamaSession.serve();

console.log("process.resourcesPath: ", process.resourcesPath);

export const registerLLMSessionHandlers = async (store: Store<StoreSchema>) => {
  // sleep for 3 seconds:
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await ollamaSession.initClient();
  const ollamaModels = await ollamaSession.listModels();
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
};
