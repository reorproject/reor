export interface AIModelConfig {
  localPath: string;
  contextLength: number;
  errorMsg?: string;
  engine: "openai" | "llamacpp";
}

export interface StoreSchema {
  user: {
    directory?: string;
    preferences?: {};
    openAIAPIKey?: string;
  };
  aiModels: {
    [modelName: string]: AIModelConfig;
  };
  defaultAIModel: string; // Key of the default model
}

// Enum for store keys
export enum StoreKeys {
  UserDirectory = "user.directory",
  UserPreferences = "user.preferences",
  UserOpenAIAPIKey = "user.openAIAPIKey",
  AIModels = "aiModels",
  DefaultAIModel = "defaultAIModel",
}
