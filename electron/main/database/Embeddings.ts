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

const worker = new Worker("./electron/main/database/textProcessingWorker.mjs");
// const repoName = "Xenova/all-MiniLM-L6-v2";

function sendMessageToWorker(task: any) {
  return new Promise((resolve, reject) => {
    worker.on("message", (message) => {
      if (message.success) {
        resolve(message.result);
      } else {
        reject(new Error(message.error));
      }
    });
    worker.on("error", reject);
    worker.postMessage(task);
  });
}

function embedText() {
  // Directly return the function that takes a batch and returns a Promise<number[][]>
  return async (data: (string | number[])[]): Promise<number[][]> => {
    if (!data.length) {
      return Promise.resolve([]);
    }

    // Assuming sendMessageToWorker correctly handles the batch and returns the desired format

    // Send the batch to the worker and wait for the processed result
    const response = await sendMessageToWorker({ type: "embed", data: data });
    // Assuming the response is in the format number[][]
    return response as number[][]; // Or process it as needed to fit the format
  };
}

function getContextLength() {
  const response = sendMessageToWorker({ type: "contextLength" });
  return response as unknown as number;
}
// Initialize the worker with your pipeline
// sendMessageToWorker({ type: "initialize", repoName })
//   .then(() => {
//     console.log("Worker initialized successfully");
//     // embedText("Hello, world!").then((result) => {
//     //   console.log("EMBEDDING RESULT: ", result);
//     // });
//   })
//   .catch(console.error);

export async function createEmbeddingFunctionFromWorker(
  embeddingModelConfig: EmbeddingModelWithRepo,
  sourceColumn: string
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  const repoName = embeddingModelConfig.repoName;
  await sendMessageToWorker({ type: "initialize", repoName });
  const contextLength = await getContextLength();
  return {
    name: embeddingModelConfig.repoName,
    contextLength: contextLength, // TODO: update this to use the thread
    sourceColumn,
    embed: embedText(),
    // tokenize: tokenizeText,
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
