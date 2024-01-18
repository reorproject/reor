import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LlamaCPPSessionService } from "./models/LlamaCpp"; // Assuming SessionService is in the same directory
import { ISessionService } from "./Types";
import { OpenAIModelSessionService } from "./models/OpenAI";
import { StoreKeys, StoreSchema } from "../Store/storeConfig";
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
    async (event: IpcMainInvokeEvent, sessionId: string): Promise<boolean> => {
      return !!sessions[sessionId];
    }
  );

  ipcMain.handle(
    "delete-session",
    async (event: IpcMainInvokeEvent, sessionId: string): Promise<string> => {
      if (sessions[sessionId]) {
        delete sessions[sessionId];
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

  // Refactored get-or-create-session handler
  ipcMain.handle(
    "get-or-create-session",
    async (event: IpcMainInvokeEvent, sessionId: string): Promise<string> => {
      if (sessions[sessionId]) {
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
      prompt: string
    ): Promise<string> => {
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
    if (!openAIAPIKey) {
      throw new Error(
        "OpenAI API key not set. Please set it in settings and re-open the chat window."
      );
    }
    const sessionService = new OpenAIModelSessionService(
      openAIAPIKey,
      defaultModelName
    );
    sessions[sessionId] = sessionService;
  } else {
    const sessionService = new LlamaCPPSessionService();
    await sessionService.init(currentConfig.localPath);
    sessions[sessionId] = sessionService;
  }
  return sessionId;
}
