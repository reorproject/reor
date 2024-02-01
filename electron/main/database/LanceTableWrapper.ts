import { Connection, Table as LanceDBTable, MetricType } from "vectordb";
import GetOrCreateLanceTable from "./Lance";
import {
  EnhancedEmbeddingFunction,
  createEmbeddingFunction,
} from "./Embeddings";
import {
  convertLanceResultToDBResult,
  sanitizePathForDatabase,
} from "./TableHelperFunctions";
import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";

export class LanceDBTableWrapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private table!: LanceDBTable<any>;
  private embedFun!: EnhancedEmbeddingFunction<string | number[]>;

  async initialize(
    dbConnection: Connection,
    userDirectory: string,
    embedFuncRepoName: string
  ) {
    this.embedFun = await createEmbeddingFunction(embedFuncRepoName, "content");
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
    data = data
      .filter((x) => x.content !== "")
      .map((x) => {
        x.content = sanitizePathForDatabase(x.content);
        return x;
      });
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

  async deleteDBItemsByFilePaths(filePaths: string[]): Promise<void> {
    const quotedFilePaths = filePaths
      .map((filePath) => sanitizePathForDatabase(filePath))
      .map((filePath) => `'${filePath}'`)
      .join(", ");
    const filterString = `${DatabaseFields.NOTE_PATH} IN (${quotedFilePaths})`;
    await this.table.delete(filterString);
  }

  async search(
    query: string,
    //   metricType: string,
    limit: number,
    filter?: string
  ): Promise<DBQueryResult[]> {
    const lanceQuery = await this.table
      .search(query)
      .metricType(MetricType.Cosine)
      // .metricType(metricType)
      .limit(limit);
    if (filter) {
      lanceQuery.filter(filter);
    }
    const rawResults = await lanceQuery.execute();
    const mapped = rawResults.map(convertLanceResultToDBResult);
    return mapped as DBQueryResult[];
  }

  async filter(filterString: string, limit: number = 10): Promise<DBEntry[]> {
    const rawResults = await this.table
      .search(Array(768).fill(1)) // TODO: remove hardcoding
      .metricType(MetricType.Cosine)
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
