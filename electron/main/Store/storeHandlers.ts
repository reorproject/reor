import { ipcMain } from "electron";
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  LLMConfig,
  StoreKeys,
  StoreSchema,
} from "../Store/storeConfig";
import Store from "electron-store";
import { validateAIModelConfig } from "../llm/llmConfig";
import {
  setupDirectoryFromPreviousSessionIfUnused,
  getVaultDirectoryForContents,
  setVaultDirectoryForContents,
  activeWindows,
} from "../windowManager";
import path from "path";
import { initializeAndMaybeMigrateStore } from "./storeMigrator";

export const registerStoreHandlers = (
  store: Store<StoreSchema>
  // fileWatcher: FSWatcher | null
) => {
  initializeAndMaybeMigrateStore(store);
  ipcMain.on(
    "set-user-directory",
    async (event, userDirectory: string): Promise<void> => {
      console.log("setting user directory", userDirectory);
      setVaultDirectoryForContents(
        activeWindows,
        event.sender,
        userDirectory,
        store
      );

      event.returnValue = "success";
    }
  );

  ipcMain.on("get-user-directory", (event) => {
    let path = getVaultDirectoryForContents(activeWindows, event.sender);
    if (!path) {
      path = setupDirectoryFromPreviousSessionIfUnused(
        activeWindows,
        event.sender,
        store
      );
    }
    event.returnValue = path;
  });
  ipcMain.on("set-default-embedding-model", (event, repoName: string) => {
    store.set(StoreKeys.DefaultEmbeddingModelAlias, repoName);
  });

  ipcMain.on(
    "add-new-local-embedding-model",
    (event, model: EmbeddingModelWithLocalPath) => {
      const currentModels = store.get(StoreKeys.EmbeddingModels) || {};
      const modelAlias = path.basename(model.localPath);
      store.set(StoreKeys.EmbeddingModels, {
        ...currentModels,
        [modelAlias]: model,
      });
      store.set(StoreKeys.DefaultEmbeddingModelAlias, modelAlias);
    }
  );

  ipcMain.on(
    "add-new-repo-embedding-model",
    (event, model: EmbeddingModelWithRepo) => {
      const currentModels = store.get(StoreKeys.EmbeddingModels) || {};
      store.set(StoreKeys.EmbeddingModels, {
        ...currentModels,
        [model.repoName]: model,
      });
      store.set(StoreKeys.DefaultEmbeddingModelAlias, model.repoName);
    }
  );

  ipcMain.on("get-embedding-models", (event) => {
    event.returnValue = store.get(StoreKeys.EmbeddingModels);
  });

  ipcMain.on(
    "update-embedding-model",
    (
      event,
      modelName: string,
      updatedModel: EmbeddingModelWithLocalPath | EmbeddingModelWithRepo
    ) => {
      const currentModels = store.get(StoreKeys.EmbeddingModels) || {};
      store.set(StoreKeys.EmbeddingModels, {
        ...currentModels,
        [modelName]: updatedModel,
      });
    }
  );

  ipcMain.on("remove-embedding-model", (event, modelName: string) => {
    const currentModels = store.get(StoreKeys.EmbeddingModels) || {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [modelName]: _, ...updatedModels } = currentModels;

    store.set(StoreKeys.EmbeddingModels, updatedModels);
  });

  ipcMain.on("set-no-of-rag-examples", (event, noOfExamples: number) => {
    store.set(StoreKeys.MaxRAGExamples, noOfExamples);
  });

  ipcMain.on("get-no-of-rag-examples", (event) => {
    event.returnValue = store.get(StoreKeys.MaxRAGExamples);
  });

  ipcMain.on("set-default-llm", (event, modelName: string) => {
    store.set(StoreKeys.DefaultLLM, modelName);
  });

  ipcMain.on("get-default-llm-name", (event) => {
    event.returnValue = store.get(StoreKeys.DefaultLLM);
  });

  ipcMain.handle("get-llm-configs", () => {
    const aiModelConfigs = store.get(StoreKeys.LLMs);
    return aiModelConfigs || {};
  });

  ipcMain.handle("get-llm-config-by-name", (event, modelName: string) => {
    const llmConfig = getLLMConfig(store, modelName);
    return llmConfig;
  });

  ipcMain.handle("add-or-update-llm", async (event, modelConfig: LLMConfig) => {
    console.log("setting up new local model", modelConfig);
    await addOrUpdateLLMSchemaInStore(store, modelConfig);
  });

  ipcMain.handle(
    "delete-local-llm",
    async (event, modelNameToDelete: string) => {
      console.log("deleting local model", modelNameToDelete);
      return await deleteLLMSchemafromStore(store, modelNameToDelete);
    }
  );

  ipcMain.on("get-default-embedding-model", (event) => {
    event.returnValue = store.get(StoreKeys.DefaultEmbeddingModelAlias);
  });

  ipcMain.on("get-hardware-config", (event) => {
    event.returnValue = store.get(StoreKeys.Hardware);
  });

  ipcMain.on("set-hardware-config", (event, hardwareConfig) => {
    store.set(StoreKeys.Hardware, hardwareConfig);
  });

  ipcMain.on("set-llm-generation-params", (event, generationParams) => {
    console.log("setting generation params", generationParams);
    store.set(StoreKeys.LLMGenerationParameters, generationParams);
  });

  ipcMain.on("get-llm-generation-params", (event) => {
    console.log(
      "getting generation params",
      store.get(StoreKeys.LLMGenerationParameters)
    );
    event.returnValue = store.get(StoreKeys.LLMGenerationParameters);
  });
};

export async function addOrUpdateLLMSchemaInStore(
  store: Store<StoreSchema>,
  modelConfig: LLMConfig
): Promise<void> {
  const existingModels = (store.get(StoreKeys.LLMs) as LLMConfig[]) || [];

  const isNotValid = validateAIModelConfig(modelConfig);
  if (isNotValid) {
    throw new Error(isNotValid);
  }

  const foundModel = getLLMConfig(store, modelConfig.modelName);

  if (foundModel) {
    const updatedModels = existingModels.map((model) =>
      model.modelName === modelConfig.modelName ? modelConfig : model
    );
    store.set(StoreKeys.LLMs, updatedModels);
  } else {
    const updatedModels = [...existingModels, modelConfig];
    store.set(StoreKeys.LLMs, updatedModels);
  }
}

export async function deleteLLMSchemafromStore(
  store: Store<StoreSchema>,
  modelName: string
): Promise<void> {
  const existingModels = (store.get(StoreKeys.LLMs) as LLMConfig[]) || [];

  const foundModel = getLLMConfig(store, modelName);

  if (!foundModel) {
    return;
  }

  const updatedModels = existingModels.filter(
    (model) => model.modelName !== modelName
  );
  store.set(StoreKeys.LLMs, updatedModels);
}

export function getLLMConfig(
  store: Store<StoreSchema>,
  modelName: string
): LLMConfig | undefined {
  const llmConfigs = store.get(StoreKeys.LLMs);
  console.log("llmConfigs: ", llmConfigs);
  if (llmConfigs) {
    return llmConfigs.find((model: LLMConfig) => model.modelName === modelName);
  }
  return undefined;
}

export function getDefaultEmbeddingModelConfig(
  store: Store<StoreSchema>
): EmbeddingModelConfig {
  const defaultEmbeddingModelAlias = store.get(
    StoreKeys.DefaultEmbeddingModelAlias
  ) as string | undefined;

  // Check if the default model alias is defined and not empty
  if (!defaultEmbeddingModelAlias) {
    throw new Error("No default embedding model is specified");
  }

  const embeddingModels = store.get(StoreKeys.EmbeddingModels) || {};

  // Check if the model with the default alias exists
  const model = embeddingModels[defaultEmbeddingModelAlias];
  if (!model) {
    throw new Error(
      `No embedding model found for alias '${defaultEmbeddingModelAlias}'`
    );
  }

  return model;
}
