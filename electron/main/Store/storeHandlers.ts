import { ipcMain } from "electron";
import { LLMModelConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { validateAIModelConfig } from "../llm/llmConfig";
import {
  setupDirectoryFromPreviousSessionIfUnused,
  getVaultDirectoryForContents,
  setVaultDirectoryForContents,
  activeWindows,
} from "../windowManager";

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
}
