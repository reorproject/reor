import { Connection, Table as LanceDBTable, Query } from "vectordb";
import GetOrCreateLanceTable from "./Lance";
import {
  EnhancedEmbeddingFunction,
  createEmbeddingFunction,
} from "./Embeddings";
import { convertLanceResultToDBResult } from "./TableHelperFunctions";

export interface DBEntry {
  notepath: string;
  vector?: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
}

export interface DBResult extends DBEntry {
  distance: number;
}

export class LanceDBTableWrapper {
  public table!: LanceDBTable<any>;
  public embedFun!: EnhancedEmbeddingFunction<string | number[]>;
  public userDirectory!: string;
  public dbConnection!: Connection;

  async initialize(dbConnection: Connection, userDirectory: string) {
    this.embedFun = await createEmbeddingFunction(
      "Xenova/bge-base-en-v1.5",
      "content"
    );
    this.userDirectory = userDirectory;
    this.dbConnection = dbConnection;
    this.table = await GetOrCreateLanceTable(
      dbConnection,
      this.embedFun,
      userDirectory
    );
  }

  async add(
    data: DBEntry[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    data = data.filter((x) => x.content !== "");
    const recordEntry: Record<string, unknown>[] = data as unknown as Record<
      string,
      unknown
    >[];
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < recordEntry.length; i += chunkSize) {
      chunks.push(recordEntry.slice(i, i + chunkSize));
    }

    let index = 0;
    const totalChunks = chunks.length;
    for (const chunk of chunks) {
      try {
        await this.table.add(chunk);
      } catch (error) {
        console.error("Error adding chunk to DB:", error);
      }
      index++;
      const progress = index / totalChunks;
      if (onProgress) {
        onProgress(progress);
      }
    }
  }

  async delete(filter: string): Promise<void> {
    await this.table.delete(filter);
  }

  async search(
    query: string,
    //   metricType: string,
    limit: number,
    filter?: string
  ): Promise<DBEntry[]> {
    const lanceQuery = await this.table
      .search(query)
      // .metricType(metricType)
      .limit(limit);
    if (filter) {
      lanceQuery.filter(filter);
    }
    const rawResults = await lanceQuery.execute();
    const mapped = rawResults.map(convertLanceResultToDBResult);
    return mapped as DBEntry[];
  }

  async filter(filterString: string, limit: number = 10) {
    const rawResults = await this.table
      .search(Array(768).fill(1)) // TODO: remove hardcoding
      .filter(filterString)
      .limit(limit)
      .execute();
    const mapped = rawResults.map(convertLanceResultToDBResult);
    // const filtered = mapped.filter((x) => x !== null);
    return mapped as DBEntry[];
  }

  async countRows(): Promise<number> {
    this.table.countRows;
    return await this.table.countRows();
  }
}
