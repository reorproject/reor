export interface BaseLLMConfig {
  modelName: string;
  contextLength: number;
  errorMsg?: string;
  engine: "openai" | "llamacpp";
}

export interface OpenAILLMConfig extends BaseLLMConfig {
  type: "openai";
  apiURL: string;
  apiKey: string;
}

export interface LocalLLMConfig extends BaseLLMConfig {
  type: "local";
  localPath: string;
}

export type LLMConfig = OpenAILLMConfig | LocalLLMConfig;

export type LLMGenerationParameters = {
  maxTokens?: number;
  temperature?: number;
};

export type EmbeddingModelConfig =
  | EmbeddingModelWithRepo
  | EmbeddingModelWithLocalPath;

export interface EmbeddingModelWithRepo {
  type: "repo";
  repoName: string;
}

export interface EmbeddingModelWithLocalPath {
  type: "local";
  localPath: string;
}
export type RAGConfig = {
  maxRAGExamples: number;
};

export type HardwareConfig = {
  useGPU: boolean;
  useCUDA: boolean;
  useVulkan: boolean;
};

export interface StoreSchema {
  schemaVersion: number;
  user: {
    vaultDirectories: string[];
    directoryFromPreviousSession?: string;
  };
  LLMs: LLMConfig[];
  embeddingModels: {
    [modelAlias: string]: EmbeddingModelConfig;
  };
  defaultLLM: string;
  defaultEmbedFuncRepo: string;
  RAG?: RAGConfig;
  hardware: HardwareConfig;
  llmGenerationParameters: LLMGenerationParameters;
}

export enum StoreKeys {
  SchemaVersion = "schemaVersion",
  DirectoryFromPreviousSession = "user.directoryFromPreviousSession",
  LLMs = "LLMs",
  EmbeddingModels = "embeddingModels",
  DefaultLLM = "defaultLLM",
  DefaultEmbeddingModelAlias = "defaultEmbeddingModelAlias",
  MaxRAGExamples = "RAG.maxRAGExamples",
  Hardware = "hardware",
  LLMGenerationParameters = "llmGenerationParameters",
}
