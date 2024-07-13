import Store from "electron-store";

import {
  LLMConfig,
  StoreKeys,
  StoreSchema,
} from "../electron-store/storeConfig";

import { OllamaService } from "./models/Ollama";

export function validateAIModelConfig(config: LLMConfig): string | null {
  // Validate localPath: ensure it's not empty
  if (!config.modelName.trim()) {
    return "Model name is required.";
  }

  // Validate contextLength: ensure it's a positive number
  if (config.contextLength && config.contextLength <= 0) {
    return "Context length must be a positive number.";
  }

  // Optional field validation for errorMsg: ensure it's not empty if provided
  if (config.errorMsg && !config.errorMsg.trim()) {
    return "Error message should not be empty if provided.";
  }

  return null;
}

export function addOrUpdateLLMSchemaInStore(
  store: Store<StoreSchema>,
  modelConfig: LLMConfig
): void {
  const existingModelsInStore = store.get(StoreKeys.LLMs);
  console.log("existingModels: ", existingModelsInStore);
  const isNotValid = validateAIModelConfig(modelConfig);
  if (isNotValid) {
    throw new Error(isNotValid);
  }

  const foundModel = existingModelsInStore.find(
    (model) => model.modelName === modelConfig.modelName
  );

  console.log("foundModel: ", foundModel);

  if (foundModel) {
    console.log("updating model");
    const updatedModels = existingModelsInStore.map((model) =>
      model.modelName === modelConfig.modelName ? modelConfig : model
    );
    store.set(StoreKeys.LLMs, updatedModels);
  } else {
    console.log("adding model");
    const updatedModels = [...existingModelsInStore, modelConfig];
    store.set(StoreKeys.LLMs, updatedModels);
  }
}

export async function removeLLM(
  store: Store<StoreSchema>,
  ollamaService: OllamaService,
  modelName: string
): Promise<void> {
  const existingModels = (store.get(StoreKeys.LLMs)) || [];

  const foundModel = await getLLMConfig(store, ollamaService, modelName);

  if (!foundModel) {
    return;
  }

  const updatedModels = existingModels.filter(
    (model) => model.modelName !== modelName
  );
  store.set(StoreKeys.LLMs, updatedModels);

  ollamaService.deleteModel(modelName);
}

export async function getAllLLMConfigs(
  store: Store<StoreSchema>,
  ollamaSession: OllamaService
): Promise<LLMConfig[]> {
  const llmConfigsFromStore = store.get(StoreKeys.LLMs) || [];
  const ollamaLLMConfigs = await ollamaSession.getAvailableModels();

  return [...llmConfigsFromStore, ...ollamaLLMConfigs];
}

export async function getLLMConfig(
  store: Store<StoreSchema>,
  ollamaSession: OllamaService,
  modelName: string
): Promise<LLMConfig | undefined> {
  const llmConfigs = await getAllLLMConfigs(store, ollamaSession);
  if (llmConfigs.length > 0) {
    return llmConfigs.find((model: LLMConfig) => model.modelName === modelName);
  }
  return undefined;
}
