import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LlamaCPPModelLoader, LlamaCPPSessionService } from "./models/LlamaCpp"; // Assuming SessionService is in the same directory
import { ISessionService } from "./Types";
import { OpenAIModel, OpenAIModelSessionService } from "./models/OpenAI";
import { AIModelConfig, StoreKeys, StoreSchema } from "../Config/storeConfig";
import Store from "electron-store";

// const modelLoader = new ModelLoader(); // Singleton
// modelLoader.loadModel(); // Load model on startup

const sessions: { [sessionId: string]: ISessionService } = {};

export const registerLLMSessionHandlers = (store: Store<StoreSchema>) => {
  const apiKey: string = store.get(StoreKeys.UserOpenAIAPIKey);
  const openAIModel = new OpenAIModel(apiKey);
  openAIModel.loadModel();
  const llamaCPPModelLoader = new LlamaCPPModelLoader();
  llamaCPPModelLoader.loadModel();
  // const gpt4SessionService = new GPT4SessionService(gpt4Model, webContents);
  // await gpt4SessionService.init();
  ipcMain.handle(
    "createSession",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      if (sessions[sessionId]) {
        throw new Error(`Session ${sessionId} already exists in App backend.`);
      }
      const sessionService = new OpenAIModelSessionService(openAIModel);
      sessions[sessionId] = sessionService;
      return sessionId;
    }
  );

  ipcMain.handle(
    "getOrCreateSession",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      if (sessions[sessionId]) {
        return sessionId;
      }
      const defaultModelName = store.get(StoreKeys.DefaultAIModel);
      const defaultModelConfig: AIModelConfig = store.get(
        `${StoreKeys.AIModels}.${defaultModelName}`
      );
      console.log("model name: ", defaultModelName);
      console.log("DEFAULT MODEL CONFIG IS: ", defaultModelConfig);
      if (defaultModelConfig.engine === "openai") {
        const sessionService = new OpenAIModelSessionService(openAIModel);
        sessions[sessionId] = sessionService;
        return sessionId;
      } else {
        const sessionService = new LlamaCPPSessionService(llamaCPPModelLoader);
        sessions[sessionId] = sessionService;
        return sessionId;
      }
    }
  );

  ipcMain.handle(
    "initializeStreamingResponse",
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
