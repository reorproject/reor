export interface IModel {
  loadModel(): Promise<void>;
  unloadModel(): Promise<void>;
  isModelLoaded(): boolean;
}

export interface ISessionService {
  init(): Promise<void>;
  streamingPrompt(prompt: string): Promise<string>;
}
