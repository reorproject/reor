import Store from "electron-store";
import { LLMConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
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

  // Validate engine: ensure it's either "openai" or "llamacpp"
  if (config.engine !== "openai" && config.engine !== "llamacpp") {
    return "Engine must be either 'openai' or 'llamacpp'.";
  }
  if (
    config.type == "local" &&
    !config.localPath &&
    !config.localPath?.trim()
  ) {
    return "Local path is required.";
  }

  // Optional field validation for errorMsg: ensure it's not empty if provided
  if (config.errorMsg && !config.errorMsg.trim()) {
    return "Error message should not be empty if provided.";
  }

  return null;
}

export async function addOrUpdateLLMSchemaInStore(
  store: Store<StoreSchema>,
  modelConfig: LLMConfig
): Promise<void> {
  const existingModels = (store.get(StoreKeys.LLMs) as LLMConfig[]) || [];
  console.log("existingModels: ", existingModels);
  const isNotValid = validateAIModelConfig(modelConfig);
  if (isNotValid) {
    throw new Error(isNotValid);
  }

  // so here, we'd actually need to call the ollamaService to actually setup the model.
  // but for now, we can just do it manually - which means we probably don't want to call this for now.
  // yes because adding in this config will interfere with our actual setp

  // const foundModel = getLLMConfig(store, ollamaService, modelConfig.modelName);

  // if (foundModel) {
  //   const updatedModels = existingModels.map((model) =>
  //     model.modelName === modelConfig.modelName ? modelConfig : model
  //   );
  //   store.set(StoreKeys.LLMs, updatedModels);
  // } else {
  //   const updatedModels = [...existingModels, modelConfig];
  //   store.set(StoreKeys.LLMs, updatedModels);
  // }
}

export async function removeLLM(
  store: Store<StoreSchema>,
  ollamaService: OllamaService,
  modelName: string
): Promise<void> {
  const existingModels = (store.get(StoreKeys.LLMs) as LLMConfig[]) || [];

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
  const llmConfigsFromStore = store.get(StoreKeys.LLMs);
  const ollamaLLMConfigs = await ollamaSession.getAvailableModels();

  return [...llmConfigsFromStore, ...ollamaLLMConfigs];
}

export async function getLLMConfig(
  store: Store<StoreSchema>,
  ollamaSession: OllamaService,
  modelName: string
): Promise<LLMConfig | undefined> {
  const llmConfigs = await getAllLLMConfigs(store, ollamaSession);
  console.log("llmConfigs: ", llmConfigs);
  if (llmConfigs) {
    return llmConfigs.find((model: LLMConfig) => model.modelName === modelName);
  }
  return undefined;
}
