interface BaseAIModelConfig {
  contextLength: number;
  errorMsg?: string;
  engine: "openai" | "llamacpp";
}

export interface OpenAIAIModelConfig extends BaseAIModelConfig {
  type: "openai";
  apiURL: string;
  apiKey: string;
}

export interface LocalAIModelConfig extends BaseAIModelConfig {
  type: "local";
  localPath: string;
}

export type AIModelConfig = OpenAIAIModelConfig | LocalAIModelConfig;

export interface RAGConfig {
  maxRAGExamples: number;
}

export interface StoreSchema {
  vaultDirectoriesOpenInWindows: string[];
  aiModels: {
    [modelName: string]: AIModelConfig;
  };
  defaultAIModel: string; // Key of the default model
  defaultEmbedFuncRepo: string;
  RAG?: RAGConfig; // Optional RAG configuration
}

// Enum for store keys
export enum StoreKeys {
  VaultDirectoriesOpenInWindows = "vaultDirectoriesOpenInWindows",
  AIModels = "aiModels",
  DefaultAIModel = "defaultAIModel",
  DefaultEmbedFuncRepo = "defaultEmbedFuncRepo",
  MaxRAGExamples = "RAG.maxRAGExamples", // New enum value for RAG max context length
}
