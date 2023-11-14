import { Connection, Table as LanceDBTable, Query } from "vectordb";
import GetOrCreateTable from "./Lance";
import { DatabaseFields } from "./Schema";

interface RagnoteDBEntry {
  notepath: string;
  vector?: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
}

export class RagnoteTable {
  // implements Table
  private table!: LanceDBTable<string>;
  private embeddingModelHFRepo = "Xenova/all-MiniLM-L6-v2";

  // private embedFun?: EmbeddingFunction;

  async initialize(dbConnection: Connection, tableName: string) {
    this.table = await GetOrCreateTable(
      dbConnection,
      this.embeddingModelHFRepo
    );
  }

  async add(data: RagnoteDBEntry[]): Promise<void> {
    console.log("CALLING ADD METHOD WITH THE FOLLOWING ARGS: ", data);
    const recordEntry: Record<string, unknown>[] = data as unknown as Record<
      string,
      unknown
    >[];
    await this.table.add(recordEntry);
  }

  async delete(filter: string): Promise<void> {
    // TODO: maybe make the filter typed as well...
    await this.table.delete(filter);
  }

  async search(
    query: string,
    //   metricType: string,
    limit: number
  ): Promise<RagnoteDBEntry[]> {
    const lanceQuery = await this.table
      .search(query)
      // .metricType(metricType)
      .limit(limit);
    const rawResults = await lanceQuery.execute();
    const mapped = rawResults.map(convertToRagnoteDBEntry);
    // const filtered = mapped.filter((x) => x !== null);
    return mapped as RagnoteDBEntry[];
    // return rawResults;
  }

  async filter(filterString: string) {
    // const query = new Query("asdf");
    const rawResults = await this.table
      .search("")
      .filter(filterString)
      .execute();
    // query.filter(filterString);
    // const rawResults = await query.execute();
    const mapped = rawResults.map(convertToRagnoteDBEntry);
    // const filtered = mapped.filter((x) => x !== null);
    return mapped as RagnoteDBEntry[];

    // const lanceQuery = await this.table.filter(filterString);
    // const rawResults = await lanceQuery.execute();
    // const mapped = rawResults.map(convertToRagnoteDBEntry);
    // // const filtered = mapped.filter((x) => x !== null);
    // return mapped as RagnoteDBEntry[];
  }

  async countRows(): Promise<number> {
    this.table.countRows;
    return await this.table.countRows();
  }
}

function convertToRecord(entry: RagnoteDBEntry): Record<string, unknown> {
  const recordEntry: Record<string, unknown> = entry as unknown as Record<
    string,
    unknown
  >;
  return recordEntry;
}

function convertToRagnoteDBEntry(
  record: Record<string, unknown>
): RagnoteDBEntry | null {
  if (
    DatabaseFields.NOTE_PATH in record &&
    DatabaseFields.VECTOR in record &&
    DatabaseFields.CONTENT in record &&
    DatabaseFields.SUB_NOTE_INDEX in record &&
    DatabaseFields.TIME_ADDED in record
  ) {
    return record as unknown as RagnoteDBEntry;
  }
  return null;
}
