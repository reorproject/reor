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
  user: {
    directory?: string;
  };
  aiModels: {
    [modelName: string]: AIModelConfig;
  };
  defaultAIModel: string;
  defaultEmbedFuncRepo: string;
  RAG?: RAGConfig;
}

export enum StoreKeys {
  UserDirectory = "user.directory",
  AIModels = "aiModels",
  DefaultAIModel = "defaultAIModel",
  DefaultEmbedFuncRepo = "defaultEmbedFuncRepo",
  MaxRAGExamples = "RAG.maxRAGExamples",
}
