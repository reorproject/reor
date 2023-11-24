import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LlamaCPPModelLoader, LlamaCPPSessionService } from "./models/LlamaCpp"; // Assuming SessionService is in the same directory
import { ISessionService } from "./Types";
import { GPT4Model, GPT4SessionService } from "./models/GPT4";

// const modelLoader = new ModelLoader(); // Singleton
// modelLoader.loadModel(); // Load model on startup
const gpt4Model = new GPT4Model(
  "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"
);
gpt4Model.loadModel();
const llamaCPPModelLoader = new LlamaCPPModelLoader();
llamaCPPModelLoader.loadModel();
// const gpt4SessionService = new GPT4SessionService(gpt4Model, webContents);
// await gpt4SessionService.init();

const sessions: { [sessionId: string]: ISessionService } = {};

export const registerSessionHandlers = () => {
  ipcMain.handle(
    "createSession",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      if (sessions[sessionId]) {
        throw new Error(`Session ${sessionId} already exists in App backend.`);
      }
      const sessionService = new LlamaCPPSessionService(llamaCPPModelLoader);
      const gpt4SessionService = new GPT4SessionService(gpt4Model);
      sessions[sessionId] = sessionService;
      return sessionId;
    }
  );

  ipcMain.handle(
    "initializeStreamingResponse",
    async (event: IpcMainInvokeEvent, sessionId: string, prompt: string) => {
      const sessionService = sessions[sessionId];
      if (!sessionService) {
        throw new Error(`Session ${sessionId} does not exist.`);
      }
      // const gpt4SessionService = new GPT4SessionService(gpt4Model);
      // const gpt4Res = await gpt4SessionService.streamingPrompt(
      //   prompt,
      //   event.sender
      // );
      return sessionService.streamingPrompt(prompt, event.sender);
    }
  );
};
