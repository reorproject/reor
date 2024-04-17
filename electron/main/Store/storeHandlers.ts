import { ipcMain } from "electron";
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  StoreKeys,
  StoreSchema,
} from "../Store/storeConfig";
import Store from "electron-store";
import path from "path";
import { initializeAndMaybeMigrateStore } from "./storeMigrator";
import WindowsManager from "../windowManager";

export const registerStoreHandlers = (
  store: Store<StoreSchema>,
  windowsManager: WindowsManager
  // fileWatcher: FSWatcher | null
) => {
  initializeAndMaybeMigrateStore(store);
  ipcMain.handle(
    "set-vault-directory-for-window",
    async (event, userDirectory: string): Promise<void> => {
      console.log("setting user directory", userDirectory);
      windowsManager.setVaultDirectoryForContents(
        event.sender,
        userDirectory,
        store
      );
    }
  );

  ipcMain.handle("get-vault-directory-for-window", (event) => {
    let path = windowsManager.getVaultDirectoryForWinContents(event.sender);
    if (!path) {
      path = windowsManager.getAndSetupDirectoryForWindowFromPreviousAppSession(
        event.sender,
        store
      );
    }
    return path;
  });
  ipcMain.handle("set-default-embedding-model", (event, repoName: string) => {
    store.set(StoreKeys.DefaultEmbeddingModelAlias, repoName);
  });

  ipcMain.handle(
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

  ipcMain.handle(
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

  ipcMain.handle("get-embedding-models", () => {
    return store.get(StoreKeys.EmbeddingModels);
  });

  ipcMain.handle(
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

  ipcMain.handle("remove-embedding-model", (event, modelName: string) => {
    const currentModels = store.get(StoreKeys.EmbeddingModels) || {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [modelName]: _, ...updatedModels } = currentModels;

    store.set(StoreKeys.EmbeddingModels, updatedModels);
  });

  ipcMain.handle("set-no-of-rag-examples", (event, noOfExamples: number) => {
    store.set(StoreKeys.MaxRAGExamples, noOfExamples);
  });

  ipcMain.handle("get-no-of-rag-examples", () => {
    return store.get(StoreKeys.MaxRAGExamples);
  });

  ipcMain.handle("get-default-embedding-model", () => {
    return store.get(StoreKeys.DefaultEmbeddingModelAlias);
  });

  ipcMain.handle("get-hardware-config", () => {
    return store.get(StoreKeys.Hardware);
  });

  ipcMain.handle("set-hardware-config", (event, hardwareConfig) => {
    store.set(StoreKeys.Hardware, hardwareConfig);
  });

  ipcMain.handle("set-llm-generation-params", (event, generationParams) => {
    console.log("setting generation params", generationParams);
    store.set(StoreKeys.LLMGenerationParameters, generationParams);
  });

  ipcMain.handle("get-llm-generation-params", () => {
    console.log(
      "getting generation params",
      store.get(StoreKeys.LLMGenerationParameters)
    );
    return store.get(StoreKeys.LLMGenerationParameters);
  });

  ipcMain.handle("has-user-opened-app-before", () => {
    return store.get(StoreKeys.hasUserOpenedAppBefore);
  });

  ipcMain.handle("set-user-has-opened-app-before", () => {
    store.set(StoreKeys.hasUserOpenedAppBefore, true);
  });
};

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
