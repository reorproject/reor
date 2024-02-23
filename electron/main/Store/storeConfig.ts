interface BaseLLMConfig {
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

export type LLMModelConfig = OpenAILLMConfig | LocalLLMConfig;

export interface EmbeddingModelWithRepo {
  type: "repo";
  repoName: string;
}

export interface EmbeddingModelWithLocalPath {
  type: "local";
  localPath: string;
}

export type EmbeddingModelConfig =
  | EmbeddingModelWithRepo
  | EmbeddingModelWithLocalPath;

export interface RAGConfig {
  maxRAGExamples: number;
}

export interface StoreSchema {
  user: {
    vaultDirectories: string[];
    directoryFromPreviousSession?: string;
  };
  LLMs: {
    [modelName: string]: LLMModelConfig;
  };
  embeddingModels: {
    [modelAlias: string]: EmbeddingModelConfig;
  };
  defaultLLM: string;
  defaultEmbedFuncRepo: string;
  RAG?: RAGConfig;
}

export enum StoreKeys {
  DirectoryFromPreviousSession = "user.directoryFromPreviousSession",
  LLMs = "LLMs",
  EmbeddingModels = "embeddingModels",
  DefaultLLM = "defaultLLM",
  DefaultEmbeddingModelAlias = "defaultEmbeddingModelAlias",
  MaxRAGExamples = "RAG.maxRAGExamples",
}
