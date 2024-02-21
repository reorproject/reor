import * as lancedb from "vectordb";
import { Pipeline, PreTrainedTokenizer } from "@xenova/transformers";
import path from "path";
import { app } from "electron";
import { errorToString } from "../Generic/error";

export interface EnhancedEmbeddingFunction<T>
  extends lancedb.EmbeddingFunction<T> {
  name: string;
  contextLength: number;
  tokenize: (data: T[]) => string[];
}

export async function createEmbeddingFunction(
  repoName: string,
  sourceColumn: string
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  let pipe: Pipeline;
  let tokenizer: PreTrainedTokenizer;
  let contextLength: number;
  try {
    const { pipeline, env, AutoTokenizer } = await import(
      "@xenova/transformers"
    );
    const cacheDir = path.join(app.getPath("userData"), "models", "embeddings");
    env.cacheDir = cacheDir;
    // if condition to check either local or cache model and ensure that
    // only either localpath or reponame is set
    env.localModelPath =
      "/Users/sam/Desktop/test-hf-modelsa/all-MiniLM-L6-v2afds";
    env.allowRemoteModels = false;
    try {
      pipe = (await pipeline(
        "feature-extraction"
        // repoName
        // {cache_dir: cacheDir,
      )) as Pipeline;
      contextLength = pipe.model.config.hidden_size;
    } catch (error) {
      throw new Error(
        `Pipeline initialization failed for repo '${repoName}': ${errorToString(
          error
        )}`
      );
    }

    try {
      tokenizer = await AutoTokenizer.from_pretrained(repoName, {
        // cache_dir: cacheDir,
      });
    } catch (error) {
      throw new Error(
        `Tokenizer initialization failed for repo '${repoName}': ${errorToString(
          error
        )}`
      );
    }
  } catch (error) {
    console.error(`Resource initialization failed: ${errorToString(error)}`);
    throw new Error(`Resource initialization failed: ${errorToString(error)}`);
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
      if (!pipe) {
        throw new Error("Pipeline not initialized");
      }
      try {
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
      } catch (error) {
        console.error(
          `Embedding batch process failed: ${errorToString(error)}`
        );
        throw new Error(
          `Embedding batch process failed: ${errorToString(error)}`
        );
      }
    },
    tokenize: (data: (string | number[])[]): string[] => {
      if (!tokenizer) {
        throw new Error("Tokenizer not initialized");
      }
      try {
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
      } catch (error) {
        console.error(
          `Tokenization batch process failed: ${errorToString(error)}`
        );
        throw new Error(
          `Tokenization batch process failed: ${errorToString(error)}`
        );
      }
    },
  };
}
