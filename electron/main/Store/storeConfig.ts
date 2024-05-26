import { ChatHistory } from "@/components/Chat/Chat";

export interface BaseLLMConfig {
  modelName: string;
  contextLength: number;
  errorMsg?: string;
}

export interface OpenAILLMConfig extends BaseLLMConfig {
  type: "openai";
  engine: "openai";
  apiURL: string;
  apiKey: string;
}

export interface AnthropicLLMConfig extends BaseLLMConfig {
  type: "anthropic";
  engine: "anthropic";
  apiURL: string;
  apiKey: string;
}

export type LLMConfig = OpenAILLMConfig | AnthropicLLMConfig;

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
  hasUserOpenedAppBefore: boolean;
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
  chatHistories: {
    [vaultDir: string]: ChatHistory[];
  };
  analytics?: boolean;
}

export enum StoreKeys {
  hasUserOpenedAppBefore = "hasUserOpenedAppBefore",
  Analytics = "analytics",
  SchemaVersion = "schemaVersion",
  DirectoryFromPreviousSession = "user.directoryFromPreviousSession",
  LLMs = "LLMs",
  EmbeddingModels = "embeddingModels",
  DefaultLLM = "defaultLLM",
  DefaultEmbeddingModelAlias = "defaultEmbeddingModelAlias",
  MaxRAGExamples = "RAG.maxRAGExamples",
  Hardware = "hardware",
  LLMGenerationParameters = "llmGenerationParameters",
  ChatHistories = "chatHistories",
}
