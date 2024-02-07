export interface AIModelConfig {
  localPath: string;
  contextLength?: number;
  errorMsg?: string;
  engine: "openai" | "llamacpp";
}

export interface RAGConfig {
  maxRAGExamples: number;
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
  RAG?: RAGConfig; // Optional RAG configuration
}

// Enum for store keys
export enum StoreKeys {
  UserDirectory = "user.directory",
  UserOpenAIAPIKey = "user.openAIAPIKey",
  AIModels = "aiModels",
  DefaultAIModel = "defaultAIModel",
  DefaultEmbedFuncRepo = "defaultEmbedFuncRepo",
  MaxRAGExamples = "RAG.maxRAGExamples", // New enum value for RAG max context length
}
