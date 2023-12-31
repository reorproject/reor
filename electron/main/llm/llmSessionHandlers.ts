import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LlamaCPPSessionService } from "./models/LlamaCpp"; // Assuming SessionService is in the same directory
import { ISessionService } from "./Types";
import { OpenAIModelSessionService } from "./models/OpenAI";
import { AIModelConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";

// const modelLoader = new ModelLoader(); // Singleton
// modelLoader.loadModel(); // Load model on startup

const sessions: { [sessionId: string]: ISessionService } = {};

export const registerLLMSessionHandlers = (store: Store<StoreSchema>) => {
  // const llamaCPPModelLoader = new LlamaCPPModelLoader();
  // llamaCPPModelLoader.loadModel();
  // const gpt4SessionService = new GPT4SessionService(gpt4Model, webContents);
  // await gpt4SessionService.init();

  ipcMain.handle(
    "does-session-exist",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      return !!sessions[sessionId];
    }
  );

  ipcMain.handle(
    "delete-session",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      if (sessions[sessionId]) {
        delete sessions[sessionId];
      }
      return "success";
    }
  );
  ipcMain.handle(
    "create-session",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      return createSession(store, sessionId);
    }
  );

  // Refactored get-or-create-session handler
  ipcMain.handle(
    "get-or-create-session",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      if (sessions[sessionId]) {
        return sessionId;
      }
      return createSession(store, sessionId);
    }
  );

  ipcMain.handle(
    "initialize-streaming-response",
    async (event: IpcMainInvokeEvent, sessionId: string, prompt: string) => {
      const sessionService = sessions[sessionId];
      if (!sessionService) {
        throw new Error(`Session ${sessionId} does not exist.`);
      }

      const apiKey: string = store.get(StoreKeys.UserOpenAIAPIKey);
      return sessionService.streamingPrompt(prompt, event.sender, apiKey);
    }
  );
};

async function createSession(
  store: Store<StoreSchema>,
  sessionId: string
): Promise<string> {
  const defaultModelName = store.get(StoreKeys.DefaultAIModel);

  const allConfigs = store.get(StoreKeys.AIModels);
  const currentConfig = allConfigs[defaultModelName];

  if (currentConfig.engine === "openai") {
    const openAIAPIKey: string = store.get(StoreKeys.UserOpenAIAPIKey);
    const sessionService = new OpenAIModelSessionService(
      openAIAPIKey,
      defaultModelName
    );
    sessions[sessionId] = sessionService;
  } else {
    const sessionService = new LlamaCPPSessionService(currentConfig.localPath);
    sessions[sessionId] = sessionService;
  }
  return sessionId;
}
