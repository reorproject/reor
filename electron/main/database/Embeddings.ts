import * as lancedb from "vectordb";
import { Pipeline, PreTrainedTokenizer } from "@xenova/transformers";
// Import path library:
import path from "path";
import { DownloadModelFilesFromHFRepo } from "../download/download";
import { app } from "electron";

// import { pipeline } from '@xenova/transformers';

// import pipeline from '@xenova/transformers';
// const requireESM = require('esm')(module);

// const pipe = requireESM('@xenova/transformers');

// export const setupPipeline = async (modelName: string) => {
//   /*
//   just noting for future explorers that we do a dynamic import because transformers.js is an ESM module,
//   and this repo is not yet and so doing the import at the top pollutes
//   this repo turning it into an ESM repo... super annoying and the whole industry
//   is dealing with this problem now as we transition into ESM.
//   */
//   const { pipeline } = await import("@xenova/transformers");
//   return pipeline("feature-extraction", modelName);
// };
// const pipe: any = null;

// async function initPipe() {
//   const { pipeline } = await import('@xenova/transformers');
//   pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
// }

// initPipe().catch((error) =>
//   console.error('Failed to initialize pipeline:', error),
// );

export interface EnhancedEmbeddingFunction<T>
  extends lancedb.EmbeddingFunction<T> {
  /**
   * A method to tokenize the input data before embedding.
   */
  name: string;
  contextLength: number;
  tokenize: (data: T[]) => string[];
}

export async function createEmbeddingFunction(
  repoName: string, // all-MiniLM-L6-v2
  sourceColumn: string
  // embeddingModelsPath: string
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  let pipe: Pipeline;
  let tokenizer: PreTrainedTokenizer;
  let contextLength: number;
  try {
    const { pipeline, env, AutoTokenizer } = await import(
      "@xenova/transformers"
    );
    // env.localModelPath = embeddingModelsPath;
    // env.allowRemoteModels = false;
    // env.allowLocalModels = true;
    const cacheDir = path.join(app.getPath("userData"), "models", "embeddings");
    console.log("CACHE DIR IS: ", cacheDir);
    env.cacheDir = cacheDir;
    pipe = (await pipeline("feature-extraction", repoName, {
      cache_dir: cacheDir,
    })) as Pipeline;
    console.log("MODEL CONFIG IS: ", pipe.model.config.hidden_size);
    contextLength = pipe.model.config.hidden_size;

    tokenizer = await AutoTokenizer.from_pretrained(repoName, {
      cache_dir: cacheDir,
    });
  } catch (error) {
    console.error("Failed to initialize pipeline", error);
    throw error;
  }
  return {
    name: repoName,
    contextLength: contextLength,
    sourceColumn,
    embed: async (batch: (string | number[])[]): Promise<number[][]> => {
      if (batch.length === 0 || batch[0].length === 0) {
        return [];
      }
      if (typeof batch[0][0] === "number") {
        return batch as number[][];
      }
      if (pipe === null) {
        throw new Error("Pipeline not initialized");
      }
      try {
        const result: number[][] = await Promise.all(
          batch.map(async (text) => {
            const res = await pipe(text, {
              pooling: "mean",
              normalize: true,
            });
            return Array.from(res.data);
          })
        );
        return result;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    tokenize: (data: (string | number[])[]): any[] => {
      if (tokenizer === null) {
        throw new Error("Tokenizer not initialized");
      }
      return data.map((text) => {
        const res = tokenizer(text);
        return res;
      });
    },
  };
}
