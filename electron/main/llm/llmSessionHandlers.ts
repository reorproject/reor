import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LlamaCPPSessionService } from "./models/LlamaCpp";
import { LLMSessionService } from "./Types";
import { OpenAIModelSessionService } from "./models/OpenAI";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";

export const LLMSessions: { [sessionId: string]: LLMSessionService } = {};

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
    "initialize-streaming-response",
    async (
      event: IpcMainInvokeEvent,
      sessionId: string,
      prompt: string,
      ignoreChatHistory: boolean
    ): Promise<string> => {
      const sessionService = LLMSessions[sessionId];
      if (!sessionService) {
        throw new Error(`Session ${sessionId} does not exist.`);
      }

      return sessionService.streamingPrompt(
        prompt,
        event.sender,
        "",
        ignoreChatHistory
      );
    }
  );
};

async function createSession(
  store: Store<StoreSchema>,
  sessionId: string
): Promise<string> {
  const defaultModelName = store.get(StoreKeys.DefaultLLM);
  if (!defaultModelName) {
    throw new Error(
      "No default LLM model configured. Please choose either a local or a remote LLM in Settings."
    );
  }
  const allConfigs = store.get(StoreKeys.LLMs);

  if (!allConfigs) {
    throw new Error("No AI models configured");
  }

  const currentModelConfig = allConfigs[defaultModelName];

  const hardwareConfig = store.get(StoreKeys.Hardware);

  if (currentModelConfig.type === "openai") {
    const sessionService = new OpenAIModelSessionService();
    await sessionService.init(defaultModelName, currentModelConfig);
    LLMSessions[sessionId] = sessionService;
  } else {
    const sessionService = new LlamaCPPSessionService();
    await sessionService.init(
      defaultModelName,
      currentModelConfig,
      hardwareConfig
    );
    LLMSessions[sessionId] = sessionService;
  }
  return sessionId;
}
