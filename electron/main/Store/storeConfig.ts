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
  defaultLLM: string;
  defaultEmbedFuncRepo: string;
  RAG?: RAGConfig;
}

export enum StoreKeys {
  VaultDirectories = "user.vaultDirectories",
  DirectoryFromPreviousSession = "user.directoryFromPreviousSession",
  LLMs = "LLMs",
  DefaultLLM = "defaultLLM",
  DefaultEmbedFuncRepo = "defaultEmbedFuncRepo",
  MaxRAGExamples = "RAG.maxRAGExamples",
}
