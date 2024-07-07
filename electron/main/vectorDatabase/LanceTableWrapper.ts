import {
  Connection,
  Table as LanceDBTable,
  MetricType,
  makeArrowTable,
} from "vectordb";

import { EmbeddingModelConfig } from "../electronStore/storeConfig";

import {
  EnhancedEmbeddingFunction,
  createEmbeddingFunction,
} from "./Embeddings";
import GetOrCreateLanceTable from "./Lance";
import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";
import {
  convertRecordToDBType,
  sanitizePathForDatabase,
} from "./TableHelperFunctions";

export class LanceDBTableWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public lanceTable!: LanceDBTable<any>;
  private embedFun!: EnhancedEmbeddingFunction<string | number[]>;

  async initialize(
    dbConnection: Connection,
    userDirectory: string,
    embeddingModelConfig: EmbeddingModelConfig
  ) {
    try {
      this.embedFun = await createEmbeddingFunction(
        embeddingModelConfig,
        "content"
      );
    } catch (error) {
      throw new Error("Embedding function error: " + error);
    }

    this.lanceTable = await GetOrCreateLanceTable(
      dbConnection,
      this.embedFun,
      userDirectory
    );
  }

  async add(
    data: DBEntry[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    data = data
      .filter((x) => x.content !== "")
      .map((x) => {
        x.notepath = sanitizePathForDatabase(x.notepath);
        return x;
      });

    //clean up previously indexed entries and reindex the whole file
    await this.deleteDBItemsByFilePaths(data.map((x) => x.notepath));

    const recordEntry: Record<string, unknown>[] = data as unknown as Record<
      string,
      unknown
    >[];
    const numberOfChunksToIndexAtOnce = 50;
    const chunks = [];
    for (let i = 0; i < recordEntry.length; i += numberOfChunksToIndexAtOnce) {
      chunks.push(recordEntry.slice(i, i + numberOfChunksToIndexAtOnce));
    }

    if (chunks.length == 0) return;

    let index = 0;
    const totalChunks = chunks.length;
    for (const chunk of chunks) {
      const arrowTableOfChunk = makeArrowTable(chunk);
      await this.lanceTable.add(arrowTableOfChunk);

      index++;
      const progress = index / totalChunks;
      if (onProgress) {
        onProgress(progress);
      }
    }
  }

  async deleteDBItemsByFilePaths(filePaths: string[]): Promise<void> {
    const quotedFilePaths = filePaths
      .map((filePath) => sanitizePathForDatabase(filePath))
      .map((filePath) => `'${filePath}'`)
      .join(", ");
    if (quotedFilePaths === "") {
      return;
    }
    const filterString = `${DatabaseFields.NOTE_PATH} IN (${quotedFilePaths})`;
    try {
      await this.lanceTable.delete(filterString);
    } catch (error) {
      console.error(
        `Error deleting items from DB: ${error} using filter string: ${filterString}`
      );
    }
  }

  async updateDBItemsWithNewFilePath(
    oldFilePath: string,
    newFilePath: string
  ): Promise<void> {
    const sanitizedFilePath = sanitizePathForDatabase(oldFilePath);
    if (sanitizedFilePath === "") {
      return;
    }
    const filterString = `${DatabaseFields.NOTE_PATH} = '${sanitizedFilePath}'`;
    try {
      await this.lanceTable.update({
        where: filterString,
        values: {
          [DatabaseFields.NOTE_PATH]: sanitizePathForDatabase(newFilePath),
        },
      });
    } catch (error) {
      console.error(
        `Error updating items from DB: ${error} using filter string: ${filterString}`
      );
    }
  }

  async search(
    query: string,
    //   metricType: string,
    limit: number,
    filter?: string
  ): Promise<DBQueryResult[]> {
    const lanceQuery = await this.lanceTable
      .search(query)
      .metricType(MetricType.Cosine)
      .limit(limit);

    if (filter) {
      lanceQuery.prefilter(true);
      lanceQuery.filter(filter);
    }
    const rawResults = await lanceQuery.execute();
    const mapped = rawResults.map(convertRecordToDBType<DBQueryResult>);
    return mapped as DBQueryResult[];
  }

  async filter(filterString: string, limit: number = 10): Promise<DBEntry[]> {
    const rawResults = await this.lanceTable
      .filter(filterString)
      .limit(limit)
      .execute();
    const mapped = rawResults.map(convertRecordToDBType<DBEntry>);
    return mapped as DBEntry[];
  }

  async countRows(): Promise<number> {
    this.lanceTable.countRows;
    return await this.lanceTable.countRows();
  }
}
