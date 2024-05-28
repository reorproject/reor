import { StoreKeys, StoreSchema } from "./storeConfig";
import Store from "electron-store";

const currentSchemaVersion = 1;

export const initializeAndMaybeMigrateStore = (store: Store<StoreSchema>) => {
  const storeSchemaVersion = store.get(StoreKeys.SchemaVersion);
  if (storeSchemaVersion !== currentSchemaVersion) {
    store.set(StoreKeys.SchemaVersion, currentSchemaVersion);
    store.set(StoreKeys.LLMs, []);
    store.set(StoreKeys.DefaultLLM, "");
  }
  setupDefaultStoreValues(store);
};

export function setupDefaultStoreValues(store: Store<StoreSchema>) {
  if (!store.get(StoreKeys.MaxRAGExamples)) {
    store.set(StoreKeys.MaxRAGExamples, 15);
  }

  if (!store.get(StoreKeys.ChunkSize)) {
    store.set(StoreKeys.ChunkSize, 500);
  }
  setupDefaultAnalyticsValue(store);

  setupDefaultEmbeddingModels(store);

  setupDefaultHardwareConfig(store);
}

const setupDefaultAnalyticsValue = (store: Store<StoreSchema>) => {
  if (store.get(StoreKeys.Analytics) === undefined) {
    store.set(StoreKeys.Analytics, true);
  }
};

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
    store.set(StoreKeys.EmbeddingModels, defaultEmbeddingModelRepos);
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

const defaultEmbeddingModelRepos = {
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
