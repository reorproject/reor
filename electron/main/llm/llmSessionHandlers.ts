import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LLMSessionService } from "./Types";
import { OpenAIModelSessionService } from "./models/OpenAI";
import { LLMConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

export const LLMSessions: { [sessionId: string]: LLMSessionService } = {};

const openAISession = new OpenAIModelSessionService();
export const registerLLMSessionHandlers = (store: Store<StoreSchema>) => {
  ipcMain.handle(
    "does-session-exist",
    async (event: IpcMainInvokeEvent, sessionId: string): Promise<boolean> => {
      return !!LLMSessions[sessionId];
    }
  );

  ipcMain.handle(
    "delete-session",
    async (event: IpcMainInvokeEvent, sessionId: string): Promise<string> => {
      if (LLMSessions[sessionId]) {
        const sessionService = LLMSessions[sessionId];
        await sessionService.abort();
        delete LLMSessions[sessionId];
      }
      return "success";
    }
  );
  ipcMain.handle(
    "create-session",
    async (event: IpcMainInvokeEvent, sessionId: string): Promise<string> => {
      return await createSession(store, sessionId);
    }
  );

  ipcMain.handle(
    "get-or-create-session",
    async (event: IpcMainInvokeEvent, sessionId: string): Promise<string> => {
      if (LLMSessions[sessionId]) {
        return sessionId;
      }
      return await createSession(store, sessionId);
    }
  );

  ipcMain.handle(
    "streaming-llm-response",
    async (
      event: IpcMainInvokeEvent,
      llmName: string,
      llmConfig: LLMConfig,
      messageHistory: ChatCompletionMessageParam[]
    ): Promise<void> => {
      if (llmConfig.type === "local") {
        throw new Error("Local LLMs do not support streaming");
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

async function createSession(
  store: Store<StoreSchema>,
  sessionId: string
): Promise<string> {
  throw new Error("Not implemented");
  // const defaultModelName = store.get(StoreKeys.DefaultLLM);
  // if (!defaultModelName) {
  //   throw new Error(
  //     "No default LLM model configured. Please choose either a local or a remote LLM in Settings."
  //   );
  // }
  // const allConfigs = store.get(StoreKeys.LLMs);

  // if (!allConfigs) {
  //   throw new Error("No AI models configured");
  // }

  // const currentModelConfig = allConfigs[defaultModelName];

  // const hardwareConfig = store.get(StoreKeys.Hardware);

  // if (currentModelConfig.type === "openai") {
  //   const sessionService = new OpenAIModelSessionService();
  //   await sessionService.init(defaultModelName, currentModelConfig);
  //   LLMSessions[sessionId] = sessionService;
  // } else {
  //   const sessionService = new LlamaCPPSessionService();
  //   await sessionService.init(
  //     defaultModelName,
  //     currentModelConfig,
  //     hardwareConfig
  //   );
  //   LLMSessions[sessionId] = sessionService;
  // }
  // return sessionId;
}
