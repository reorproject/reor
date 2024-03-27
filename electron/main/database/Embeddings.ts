import * as lancedb from "vectordb";
import { Pipeline, PreTrainedTokenizer } from "@xenova/transformers";
import path from "path";
import { app } from "electron";
import { errorToString } from "../Generic/error";
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
} from "../Store/storeConfig";
import { splitDirectoryPathIntoBaseAndRepo } from "../Files/Filesystem";
import { DownloadModelFilesFromHFRepo } from "../download/download";

import { Worker } from "worker_threads";

import * as os from "os";

// Determine the optimal number of workers (e.g., number of CPU cores)
const numCPUCores = 2; //os.cpus().length;

// Create a pool of worker threads
const workers: Worker[] = [];
for (let i = 0; i < numCPUCores; i++) {
  workers.push(new Worker("./electron/main/database/textProcessingWorker.mjs"));
}

function sendMessageToWorker(worker: Worker, task: any): Promise<any> {
  return new Promise((resolve, reject) => {
    worker.once("message", (message) => {
      console.log("message: ", message);
      if (message.success) {
        resolve(message.result);
      } else {
        reject(new Error(message.error));
      }
    });
    worker.once("error", reject);
    worker.postMessage(task);
  });
}

let roundRobinIndex = 0;
function getNextWorker(): Worker {
  const worker = workers[roundRobinIndex % workers.length];
  roundRobinIndex++;
  return worker;
}

function embedText() {
  return async (data: (string | number[])[]): Promise<number[][]> => {
    if (!data.length) {
      return Promise.resolve([]);
    }

    // Select a worker for the task
    const worker = getNextWorker();
    const response = await sendMessageToWorker(worker, {
      type: "embed",
      data: data,
    });
    return response as number[][];
  };
}

function getContextLength() {
  // Select a worker for the task
  const worker = getNextWorker();
  const response = sendMessageToWorker(worker, { type: "contextLength" });
  return response as unknown as number;
}

export async function createEmbeddingFunctionFromWorker(
  embeddingModelConfig: EmbeddingModelWithRepo,
  sourceColumn: string
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  // Initialize each worker with the model configuration
  await Promise.all(
    workers.map((worker) =>
      sendMessageToWorker(worker, {
        type: "initialize",
        repoName: embeddingModelConfig.repoName,
      })
    )
  );

  const contextLength = await getContextLength(); // This might need adjustment to ensure consistency across workers

  return {
    name: embeddingModelConfig.repoName,
    contextLength: contextLength,
    sourceColumn,
    embed: embedText(),
  };
}
// Example usage for embedding

// Example usage for tokenization
// async function tokenizeText(data: (string | number[])[]): Promise<string[]> {
//   const response = await sendMessageToWorker({ type: "tokenize", data: data });
//   return response as unknown as string[];
// }

// console.log("HELLO WORLD EMBEDDED: ", embeddedText);

export interface EnhancedEmbeddingFunction<T>
  extends lancedb.EmbeddingFunction<T> {
  name: string;
  contextLength: number;
  // tokenize: (data: T[]) => Promise<string[]>;
}

export async function createEmbeddingFunction(
  embeddingModelConfig: EmbeddingModelConfig,
  sourceColumn: string
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  if (embeddingModelConfig.type === "local") {
    return createEmbeddingFunctionForLocalModel(
      embeddingModelConfig,
      sourceColumn
    );
  }
  return createEmbeddingFunctionFromWorker(embeddingModelConfig, sourceColumn);
}

export async function createEmbeddingFunctionForLocalModel(
  embeddingModelConfig: EmbeddingModelWithLocalPath,
  sourceColumn: string
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  let pipe: Pipeline;
  let repoName = "";
  let functionName = "";
  try {
    const { pipeline, env } = await import("@xenova/transformers");
    env.cacheDir = path.join(app.getPath("userData"), "models", "embeddings"); // set for all. Just to deal with library and remote inconsistencies
    console.log("config is: ", embeddingModelConfig);

    const pathParts = splitDirectoryPathIntoBaseAndRepo(
      embeddingModelConfig.localPath
    );

    env.localModelPath = pathParts.localModelPath;
    repoName = pathParts.repoName;
    env.allowRemoteModels = false;
    functionName = embeddingModelConfig.localPath;

    try {
      pipe = (await pipeline(
        "feature-extraction",
        repoName
        // {cache_dir: cacheDir,
      )) as Pipeline;
    } catch (error) {
      // here we could run a catch and try manually downloading the model...
      throw new Error(
        `Pipeline initialization failed for repo ${errorToString(error)}`
      );
    }
  } catch (error) {
    console.error(`Resource initialization failed: ${errorToString(error)}`);
    throw new Error(`Resource initialization failed: ${errorToString(error)}`);
  }
  // const tokenize = setupTokenizeFunction(pipe.tokenizer);
  const embed = await setupEmbedFunction(pipe);

  return {
    name: functionName,
    contextLength: pipe.model.config.hidden_size,
    sourceColumn,
    embed,
    // tokenize,
  };
}

export async function createEmbeddingFunctionForRepo(
  embeddingModelConfig: EmbeddingModelWithRepo,
  sourceColumn: string
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  let pipe: Pipeline;
  let repoName = "";
  let functionName = "";
  try {
    const { pipeline, env } = await import("@xenova/transformers");
    env.cacheDir = path.join(app.getPath("userData"), "models", "embeddings"); // set for all. Just to deal with library and remote inconsistencies
    console.log("config is: ", embeddingModelConfig);

    repoName = embeddingModelConfig.repoName;
    env.allowRemoteModels = true;
    functionName = embeddingModelConfig.repoName;
    try {
      pipe = (await pipeline("feature-extraction", repoName)) as Pipeline;
    } catch (error) {
      try {
        await DownloadModelFilesFromHFRepo(repoName, env.cacheDir); // try to manual download to use system proxy
        pipe = (await pipeline("feature-extraction", repoName)) as Pipeline;
      } catch (error) {
        throw new Error(
          `Pipeline initialization failed for repo ${errorToString(error)}`
        );
      }
    }
  } catch (error) {
    throw new Error(`Resource initialization failed: ${errorToString(error)}`);
  }
  // const tokenize = setupTokenizeFunction(pipe.tokenizer);
  const embed = await setupEmbedFunction(pipe);

  return {
    name: functionName,
    contextLength: pipe.model.config.hidden_size,
    sourceColumn,
    embed,
    // tokenize,
  };
}

function setupTokenizeFunction(
  tokenizer: PreTrainedTokenizer
): (data: (string | number[])[]) => string[] {
  return (data: (string | number[])[]): string[] => {
    if (!tokenizer) {
      throw new Error("Tokenizer not initialized");
    }

    return data.map((text) => {
      try {
        const res = tokenizer(text);
        return res;
      } catch (error) {
        throw new Error(
          `Tokenization process failed for text: ${errorToString(error)}`
        );
      }
    });
  };
}

async function setupEmbedFunction(
  pipe: Pipeline
): Promise<(batch: (string | number[])[]) => Promise<number[][]>> {
  return async (batch: (string | number[])[]): Promise<number[][]> => {
    if (batch.length === 0 || batch[0].length === 0) {
      return [];
    }

    if (typeof batch[0][0] === "number") {
      return batch as number[][];
    }

    if (!pipe) {
      throw new Error("Pipeline not initialized");
    }

    const result: number[][] = await Promise.all(
      batch.map(async (text) => {
        try {
          const res = await pipe(text, {
            pooling: "mean",
            normalize: true,
          });
          return Array.from(res.data);
        } catch (error) {
          throw new Error(
            `Embedding process failed for text: ${errorToString(error)}`
          );
        }
      })
    );

    return result;
  };
}
