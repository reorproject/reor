import { Connection, Table as LanceDBTable, Query } from "vectordb";
import GetOrCreateLanceTable from "./Lance";
import { DatabaseFields } from "./Schema";
import fs from "fs";
import path from "path";
import {
  EnhancedEmbeddingFunction,
  createEmbeddingFunction,
} from "./Transformers";

interface RagnoteDBEntry {
  notepath: string;
  vector?: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
}

export class RagnoteTable {
  // implements Table
  public table!: LanceDBTable<string>;
  public embedFun!: EnhancedEmbeddingFunction<string>;
  // private embeddingModelHFRepo = "Xenova/all-MiniLM-L6-v2";

  async initialize(dbConnection: Connection) {
    this.embedFun = await createEmbeddingFunction(
      "Xenova/bge-base-en-v1.5",
      "content"
    );
    this.table = await GetOrCreateLanceTable(dbConnection, this.embedFun);
  }

  async add(data: RagnoteDBEntry[]): Promise<void> {
    const recordEntry: Record<string, unknown>[] = data as unknown as Record<
      string,
      unknown
    >[];
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < recordEntry.length; i += chunkSize) {
      if (i == 1383) {
        console.log("chunk", recordEntry.slice(i, i + chunkSize));
      } else {
        chunks.push(recordEntry.slice(i, i + chunkSize));
      }
    }
    let index = 0;
    // this.
    for (const chunk of chunks) {
      try {
        console.log("adding chunk: ", index++);
        await this.table.add(chunk);
      } catch (error) {
        console.error("Error adding chunk to DB:", error);
        // Handle the error as needed, e.g., break the loop, retry, etc.
        // Example: break; // to exit the loop
      }
    }
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

export const maybeRePopulateDB = async (
  db: RagnoteTable,
  directoryPath: string,
  fileExtensions?: string[]
) => {
  const count = await db.countRows();
  const fileNames = getFilesInDirectory(directoryPath, fileExtensions);
  if (count !== fileNames.length) {
    await deleteAllRowsInTable(db);
    await populateDBWithFilesInDir(db, directoryPath, fileExtensions);
    console.log("DB has been populated");
    // get the two counts again and print:
    const count = await db.countRows();
    console.log("DB now has", count, "rows");
    console.log("no of files: ", fileNames.length, "files")
  }
};

const deleteAllRowsInTable = async (db: RagnoteTable) => {
  await db.delete(`${DatabaseFields.CONTENT} != ''`);
};

const populateDBWithFilesInDir = async (
  db: RagnoteTable,
  directoryPath: string,
  fileExtensions?: string[]
) => {
  const fileNames = getFilesInDirectory(directoryPath, fileExtensions);
  const entries: RagnoteDBEntry[] = await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = path.join(directoryPath, fileName);
      const content = readFile(filePath);
      return {
        notepath: filePath,
        content: content,
        subnoteindex: 0,
        timeadded: new Date(),
      };
    })
  );
  // const filteredEntries = entries.filter((entry) => entry.content !== "");

  await db.add(entries);

};

function readFile(filePath: string): string {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error("An error occurred:", err);
    return "";
  }
}

function getFilesInDirectory(
  directoryPath: string,
  extensions?: string[]
): string[] {
  const files = fs.readdirSync(directoryPath);
  if (!extensions) {
    return files;
  }

  return files.filter((file) => {
    const fileExtension = path.extname(file);
    return extensions.includes(fileExtension);
  });
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
