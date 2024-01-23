export interface AIModelConfig {
  localPath: string;
  contextLength?: number;
  errorMsg?: string;
  engine: "openai" | "llamacpp";
}

export interface StoreSchema {
  user: {
    directory?: string;
    openAIAPIKey?: string;
  };
  aiModels: {
    [modelName: string]: AIModelConfig;
  };
  defaultAIModel: string; // Key of the default model
  defaultEmbedFuncRepo: string;
}

// Enum for store keys
export enum StoreKeys {
  UserDirectory = "user.directory",
  UserOpenAIAPIKey = "user.openAIAPIKey",
  AIModels = "aiModels",
  DefaultAIModel = "defaultAIModel",
  DefaultEmbedFuncRepo = "defaultEmbedFuncRepo",
}
