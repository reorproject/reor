import { ipcMain } from "electron";
import { AIModelConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { validateAIModelConfig } from "../llm/llmConfig";
import { FSWatcher } from "fs";

export const registerStoreHandlers = (
  store: Store<StoreSchema>,
  fileWatcher: FSWatcher | null
) => {
  setupDefaultStoreValues(store);
  ipcMain.on(
    "set-user-directory",
    async (event, userDirectory: string): Promise<void> => {
      console.log("setting user directory", userDirectory);
      store.set(StoreKeys.UserDirectory, userDirectory);
      if (fileWatcher) {
        fileWatcher.close();
      }

      event.returnValue = "success";
    }
  );

  ipcMain.on("set-default-embed-func-repo", (event, repoName: string) => {
    store.set(StoreKeys.DefaultEmbedFuncRepo, repoName);
  });

  ipcMain.on("set-no-of-rag-examples", (event, noOfExamples: number) => {
    store.set(StoreKeys.MaxRAGExamples, noOfExamples);
  });

  ipcMain.on("get-no-of-rag-examples", (event) => {
    event.returnValue = store.get(StoreKeys.MaxRAGExamples);
  });

  ipcMain.on("set-default-ai-model", (event, modelName: string) => {
    console.log("setting default ai model", modelName);
    store.set(StoreKeys.DefaultAIModel, modelName);
  });

  // Handler to get the default AI model
  ipcMain.on("get-default-ai-model", (event) => {
    event.returnValue = store.get(StoreKeys.DefaultAIModel);
  });

  ipcMain.handle("get-ai-model-configs", () => {
    // Assuming store.get() returns the value for the given key
    const aiModelConfigs = store.get(StoreKeys.AIModels);
    return aiModelConfigs || {};
  });

  // ipcMain.handle("add-remote-models-to-store", async () => {
  //   await addRemoteModelsToElectronStore(store);
  // });

  ipcMain.handle("update-ai-model-config", (event, modelName, modelConfig) => {
    console.log("updating ai model config", modelName, modelConfig);
    const aiModelConfigs = store.get(StoreKeys.AIModels);
    if (aiModelConfigs) {
      const updatedModelConfigs = {
        ...aiModelConfigs,
        [modelName]: modelConfig,
      };
      store.set(StoreKeys.AIModels, updatedModelConfigs);
    }
  });

  // Refactored ipcMain.handle to use the new function
  ipcMain.handle(
    "setup-new-model",
    async (event, modelName: string, modelConfig: AIModelConfig) => {
      console.log("setting up new local model", modelConfig);
      return await addNewModelSchemaToStore(store, modelName, modelConfig);
    }
  );

  ipcMain.on("get-user-directory", (event) => {
    const path = store.get(StoreKeys.UserDirectory);
    event.returnValue = path;
  });

  ipcMain.on("get-default-embed-func-repo", (event) => {
    event.returnValue = store.get(StoreKeys.DefaultEmbedFuncRepo);
  });
};

export async function addNewModelSchemaToStore(
  store: Store<StoreSchema>,
  modelName: string,
  modelConfig: AIModelConfig
): Promise<string> {
  const existingModels =
    (store.get(StoreKeys.AIModels) as Record<string, AIModelConfig>) || {};

  if (!existingModels[modelName]) {
    const isNotValid = validateAIModelConfig(modelName, modelConfig);
    if (isNotValid) {
      throw new Error(isNotValid);
    }

    const updatedModels = {
      ...existingModels,
      [modelName]: modelConfig,
    };

    store.set(StoreKeys.AIModels, updatedModels);
    store.set(StoreKeys.DefaultAIModel, modelName);
    return "Model set up successfully";
  } else {
    return "Model already exists";
  }
}

export function setupDefaultStoreValues(store: Store<StoreSchema>) {
  if (!store.get(StoreKeys.MaxRAGExamples)) {
    store.set(StoreKeys.MaxRAGExamples, 10);
  }
}
