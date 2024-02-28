import { ipcMain } from "electron";
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  LLMModelConfig,
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

export const registerStoreHandlers = (
  store: Store<StoreSchema>
  // fileWatcher: FSWatcher | null
) => {
  setupDefaultStoreValues(store);
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

  ipcMain.on("get-default-llm", (event) => {
    event.returnValue = store.get(StoreKeys.DefaultLLM);
  });

  ipcMain.handle("get-llm-configs", () => {
    const aiModelConfigs = store.get(StoreKeys.LLMs);
    return aiModelConfigs || {};
  });

  ipcMain.handle("update-llm-config", (event, modelName, modelConfig) => {
    const aiModelConfigs = store.get(StoreKeys.LLMs);
    if (aiModelConfigs) {
      const updatedModelConfigs = {
        ...aiModelConfigs,
        [modelName]: modelConfig,
      };
      store.set(StoreKeys.LLMs, updatedModelConfigs);
    }
  });

  ipcMain.handle(
    "setup-new-llm",
    async (event, modelName: string, modelConfig: LLMModelConfig) => {
      console.log("setting up new local model", modelConfig);
      return await addNewLLMSchemaToStore(store, modelName, modelConfig);
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
};

export async function addNewLLMSchemaToStore(
  store: Store<StoreSchema>,
  modelName: string,
  modelConfig: LLMModelConfig
): Promise<string> {
  const existingModels =
    (store.get(StoreKeys.LLMs) as Record<string, LLMModelConfig>) || {};

  if (!existingModels[modelName]) {
    const isNotValid = validateAIModelConfig(modelName, modelConfig);
    if (isNotValid) {
      throw new Error(isNotValid);
    }

    const updatedModels = {
      ...existingModels,
      [modelName]: modelConfig,
    };

    store.set(StoreKeys.LLMs, updatedModels);
    store.set(StoreKeys.DefaultLLM, modelName);
    return "Model set up successfully";
  } else {
    return "Model already exists";
  }
}

export function setupDefaultStoreValues(store: Store<StoreSchema>) {
  if (!store.get(StoreKeys.MaxRAGExamples)) {
    store.set(StoreKeys.MaxRAGExamples, 15);
  }
  setupDefaultEmbeddingModels(store);

  setupDefaultHardwareConfig(store);
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

const setupDefaultHardwareConfig = (store: Store<StoreSchema>) => {
  const hardwareConfig = store.get(StoreKeys.Hardware);

  if (!hardwareConfig) {
    store.set(StoreKeys.Hardware, {
      useGPU: process.platform === "darwin" && process.arch === "arm64",
      useCUDA: false,
      useVulkan: false,
    });
  }
};

const setupDefaultEmbeddingModels = (store: Store<StoreSchema>) => {
  const embeddingModels = store.get(StoreKeys.EmbeddingModels);

  if (!embeddingModels) {
    store.set(StoreKeys.EmbeddingModels, modelRepos);
  }

  const defaultModel = store.get(StoreKeys.DefaultEmbeddingModelAlias);
  if (!defaultModel) {
    const embeddingModels = store.get(StoreKeys.EmbeddingModels) || {};
    if (Object.keys(embeddingModels).length === 0) {
      throw new Error("No embedding models found");
    }
    store.set(
      StoreKeys.DefaultEmbeddingModelAlias,
      Object.keys(embeddingModels)[0]
    );
  }
};

const modelRepos = {
  "Xenova/bge-base-en-v1.5": {
    type: "repo",
    repoName: "Xenova/bge-base-en-v1.5",
  },
  "Xenova/UAE-Large-V1": { type: "repo", repoName: "Xenova/UAE-Large-V1" },
  "Xenova/bge-small-en-v1.5": {
    type: "repo",
    repoName: "Xenova/bge-small-en-v1.5",
  },
};
