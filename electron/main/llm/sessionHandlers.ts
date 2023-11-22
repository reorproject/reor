import { ipcMain, IpcMainInvokeEvent } from "electron";
import { ModelLoader, SessionService } from "./LlamaCpp"; // Assuming SessionService is in the same directory

const modelLoader = new ModelLoader(); // Singleton
modelLoader.loadModel(); // Load model on startup
const sessions: { [sessionId: string]: SessionService } = {};

export const registerSessionHandlers = () => {
  ipcMain.handle(
    "createSession",
    async (event: IpcMainInvokeEvent, sessionId: string) => {
      if (sessions[sessionId]) {
        throw new Error(`Session ${sessionId} already exists in App backend.`);
      }
      const webContents = event.sender;
      const sessionService = new SessionService(modelLoader, webContents);
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
      return sessionService.streamingPrompt(prompt);
    }
  );
};
