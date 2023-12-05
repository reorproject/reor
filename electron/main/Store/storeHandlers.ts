import { ipcMain, IpcMainInvokeEvent } from "electron";
import { AIModelConfig, StoreKeys, StoreSchema } from "../Store/storeConfig";
import Store from "electron-store";
import { validateAIModelConfig } from "../llm/llmConfig";
import { FSWatcher } from "fs";

export const registerStoreHandlers = (
  store: Store<StoreSchema>,
  fileWatcher: FSWatcher | null
) => {
  ipcMain.on("set-user-directory", async (event, userDirectory: string) => {
    console.log("setting user directory", userDirectory);
    store.set(StoreKeys.UserDirectory, userDirectory);
    if (fileWatcher) {
      fileWatcher.close();
    }

    event.returnValue = "success";
  });

  ipcMain.on("set-default-ai-model", (event, modelName: string) => {
    console.log("setting default ai model", modelName);
    store.set(StoreKeys.DefaultAIModel, modelName);
  });

  // Handler to get the default AI model
  ipcMain.handle("get-default-ai-model", () => {
    return store.get(StoreKeys.DefaultAIModel);
  });

  ipcMain.handle("get-ai-model-configs", () => {
    // Assuming store.get() returns the value for the given key
    const aiModelConfigs = store.get(StoreKeys.AIModels);
    return aiModelConfigs || {};
  });

  ipcMain.handle(
    "setup-new-model",
    async (event, modelName: string, modelConfig: AIModelConfig) => {
      console.log("setting up new model", modelName, modelConfig);
      const existingModels =
        (store.get(StoreKeys.AIModels) as Record<string, AIModelConfig>) || {};

      if (existingModels[modelName]) {
        return "Model already exists";
      }
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
    }
  );

  ipcMain.on("set-openai-api-key", (event, apiKey: string) => {
    console.log("setting openai api key", apiKey);
    try {
      if (!apiKey) {
        throw new Error("API Key cannot be empty");
      }
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
};
