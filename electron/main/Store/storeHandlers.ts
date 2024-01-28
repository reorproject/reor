import { ipcMain } from "electron";
import { AIModelConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { validateAIModelConfig } from "../llm/llmConfig";
import { FSWatcher } from "fs";
import * as path from "path";

export const registerStoreHandlers = (
  store: Store<StoreSchema>,
  fileWatcher: FSWatcher | null
) => {
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

  ipcMain.handle("add-remote-models-to-store", async () => {
    await addRemoteModelsToElectronStore(store);
  });

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
    "setup-new-local-model",
    async (event, modelConfig: AIModelConfig) => {
      // ok well maybe here we could leverage the path module and use that to pass the name through.
      console.log("setting up new local model", modelConfig);
      return addNewModelSchemaToStore(
        store,
        path.basename(modelConfig.localPath),
        modelConfig
      );
    }
  );

  ipcMain.on("set-openai-api-key", (event, apiKey: string) => {
    console.log("setting openai api key", apiKey);
    try {
      store.set(StoreKeys.UserOpenAIAPIKey, apiKey);
    } catch (error) {
      console.error("Error setting openai api key", error);
    }
    event.returnValue = "success";
  });

  ipcMain.on("get-openai-api-key", (event) => {
    const apiKey = store.get(StoreKeys.UserOpenAIAPIKey);
    event.returnValue = apiKey;
  });

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
    console.log("validating model config");
    const isNotValid = validateAIModelConfig(modelName, modelConfig);
    if (isNotValid) {
      console.log("invalid model config");
      return isNotValid;
    }
    console.log("model config is valid");

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

const remoteAIModels: { [modelName: string]: AIModelConfig } = {
  "gpt-3.5-turbo-1106": {
    localPath: "",
    contextLength: 16385,
    engine: "openai",
  },
  "gpt-4-1106-preview": {
    localPath: "",
    contextLength: 128000,
    engine: "openai",
  },
  "gpt-4-0613": {
    localPath: "",
    contextLength: 8192,
    engine: "openai",
  },
};

export async function addRemoteModelsToElectronStore(
  store: Store<StoreSchema>
) {
  for (const [modelName, modelConfig] of Object.entries(remoteAIModels)) {
    await addNewModelSchemaToStore(store, modelName, modelConfig);
  }
}
