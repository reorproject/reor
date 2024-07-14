import path from 'path';

import { Pipeline, PreTrainedTokenizer } from '@xenova/transformers';
import { app } from 'electron';
import removeMd from 'remove-markdown';
import * as lancedb from 'vectordb';

import { errorToStringMainProcess } from '../common/error';
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
} from '../electron-store/storeConfig';
import { splitDirectoryPathIntoBaseAndRepo } from '../filesystem/filesystem';

import { DownloadModelFilesFromHFRepo } from './downloadModelsFromHF';
import { DBEntry } from './schema';

export interface EnhancedEmbeddingFunction<T>
  extends lancedb.EmbeddingFunction<T> {
  name: string;
  contextLength: number;
  tokenize: (data: T[]) => string[];
}

export async function createEmbeddingFunction(
  embeddingModelConfig: EmbeddingModelConfig,
  sourceColumn: string,
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  if (embeddingModelConfig.type === 'local') {
    return createEmbeddingFunctionForLocalModel(
      embeddingModelConfig,
      sourceColumn,
    );
  }
  return createEmbeddingFunctionForRepo(embeddingModelConfig, sourceColumn);
}

export async function createEmbeddingFunctionForLocalModel(
  embeddingModelConfig: EmbeddingModelWithLocalPath,
  sourceColumn: string,
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  let pipe: Pipeline;
  let repoName = '';
  let functionName = '';
  try {
    const { pipeline, env } = await import('@xenova/transformers');
    env.cacheDir = path.join(app.getPath('userData'), 'models', 'embeddings'); // set for all. Just to deal with library and remote inconsistencies
    console.log('config is: ', embeddingModelConfig);

    const pathParts = splitDirectoryPathIntoBaseAndRepo(
      embeddingModelConfig.localPath,
    );

    env.localModelPath = pathParts.localModelPath;
    repoName = pathParts.repoName;
    env.allowRemoteModels = false;
    functionName = embeddingModelConfig.localPath;

    try {
      pipe = (await pipeline(
        'feature-extraction',
        repoName,
        // {cache_dir: cacheDir,
      )) as Pipeline;
    } catch (error) {
      // here we could run a catch and try manually downloading the model...
      throw new Error(
        `Pipeline initialization failed for repo ${errorToStringMainProcess(
          error,
        )}`,
      );
    }
  } catch (error) {
    console.error(
      `Resource initialization failed: ${errorToStringMainProcess(error)}`,
    );
    throw new Error(
      `Resource initialization failed: ${errorToStringMainProcess(error)}`,
    );
  }
  const tokenize = setupTokenizeFunction(pipe.tokenizer);
  const embed = await setupEmbedFunction(pipe);

  return {
    name: functionName,
    contextLength: pipe.model.config.hidden_size,
    sourceColumn,
    embed,
    tokenize,
  };
}

export async function createEmbeddingFunctionForRepo(
  embeddingModelConfig: EmbeddingModelWithRepo,
  sourceColumn: string,
): Promise<EnhancedEmbeddingFunction<string | number[]>> {
  let pipe: Pipeline;
  let repoName = '';
  let functionName = '';
  try {
    const { pipeline, env } = await import('@xenova/transformers');
    env.cacheDir = path.join(app.getPath('userData'), 'models', 'embeddings'); // set for all. Just to deal with library and remote inconsistencies

    repoName = embeddingModelConfig.repoName;
    env.allowRemoteModels = true;
    functionName = embeddingModelConfig.repoName;

    console.log(repoName, env.cacheDir);
    try {
      pipe = (await pipeline('feature-extraction', repoName)) as Pipeline;
    } catch (error) {
      try {
        await DownloadModelFilesFromHFRepo(repoName, env.cacheDir); // try to manual download to use system proxy
        pipe = (await pipeline('feature-extraction', repoName)) as Pipeline;
      } catch (error) {
        throw new Error(
          `Pipeline initialization failed for repo ${errorToStringMainProcess(
            error,
          )}`,
        );
      }
    }
  } catch (error) {
    throw new Error(
      `Resource initialization failed: ${errorToStringMainProcess(error)}`,
    );
  }
  const tokenize = setupTokenizeFunction(pipe.tokenizer);
  const embed = await setupEmbedFunction(pipe);

  // sanitize the embedding text to remove markdown content

  return {
    name: functionName,
    contextLength: pipe.model.config.hidden_size,
    sourceColumn,
    embed,
    tokenize,
  };
}

function setupTokenizeFunction(
  tokenizer: PreTrainedTokenizer,
): (data: (string | number[])[]) => string[] {
  return (data: (string | number[])[]): string[] => {
    if (!tokenizer) {
      throw new Error('Tokenizer not initialized');
    }

    return data.map((text) => {
      try {
        const res = tokenizer(text);
        return res;
      } catch (error) {
        throw new Error(
          `Tokenization process failed for text: ${errorToStringMainProcess(
            error,
          )}`,
        );
      }
    });
  };
}

async function setupEmbedFunction(
  pipe: Pipeline,
): Promise<(batch: (string | number[])[]) => Promise<number[][]>> {
  return async (batch: (string | number[])[]): Promise<number[][]> => {
    if (batch.length === 0 || batch[0].length === 0) {
      return [];
    }

    if (typeof batch[0][0] === 'number') {
      return batch as number[][];
    }

    if (!pipe) {
      throw new Error('Pipeline not initialized');
    }

    const result: number[][] = await Promise.all(
      batch.map(async (text) => {
        try {
          const res = await pipe(removeMd(text as string), {
            pooling: 'mean',
            normalize: true,
          });
          return Array.from(res.data);
        } catch (error) {
          throw new Error(
            `Embedding process failed for text: ${errorToStringMainProcess(
              error,
            )}`,
          );
        }
      }),
    );

    return result;
  };
}

export const rerankSearchedEmbeddings = async (
  query: string,
  searchResults: DBEntry[],
) => {
  const { env, AutoModelForSequenceClassification, AutoTokenizer } =
    await import('@xenova/transformers');
  env.cacheDir = path.join(app.getPath('userData'), 'models', 'reranker'); // set for all. Just to deal with library and remote inconsistencies

  const tokenizer = await AutoTokenizer.from_pretrained(
    'Xenova/bge-reranker-base',
  );
  const model = await AutoModelForSequenceClassification.from_pretrained(
    'Xenova/bge-reranker-base',
  );

  const queries = Array(searchResults.length).fill(query);

  const inputs = tokenizer(queries, {
    text_pair: searchResults.map((item) => item.content),
    padding: true,
    truncation: true,
  });

  const scores = await model(inputs);
  // map logits to searchResults by index
  const resultsWithIndex = searchResults.map((item, index) => ({
    ...item,
    score: scores.logits.data[index],
  }));

  // TODO: we should allow users to set threshold for sensitivity too.
  return resultsWithIndex
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0);
};
