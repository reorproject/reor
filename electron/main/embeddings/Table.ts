import { Connection, Table as LanceDBTable, Query } from "vectordb";
import GetOrCreateLanceTable from "./Lance";
import { DatabaseFields } from "./Schema";
import fs from "fs";
import path from "path";
import {
  EnhancedEmbeddingFunction,
  createEmbeddingFunction,
} from "./Transformers";
import { GetFilesInfo } from "../Files/Filesystem";
import { FileInfo } from "../Files/Types";

export interface RagnoteDBEntry {
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
    const chunkSize = 100;
    const chunks = [];
    for (let i = 0; i < recordEntry.length; i += chunkSize) {
      chunks.push(recordEntry.slice(i, i + chunkSize));
    }
    let index = 0;
    console.log("50th", chunks[1391]);
    // this.
    for (const chunk of chunks) {
      try {
        console.log("index is: ", index);
        await this.table.add(chunk);
      } catch (error) {
        console.error("Error adding chunk to DB:", error);
        // Handle the error as needed, e.g., break the loop, retry, etc.
        // Example: break; // to exit the loop
      }
      index++;
      // break;
    }
  }

  async delete(filter: string): Promise<void> {
    // TODO: maybe make the filter typed as well...
    await this.table.delete(filter);
  }

  async search(
    query: string,
    //   metricType: string,
    limit: number,
    filter?: string
  ): Promise<RagnoteDBEntry[]> {
    const lanceQuery = await this.table
      .search(query)
      // .metricType(metricType)
      .limit(limit);
    if (filter) {
      lanceQuery.filter(filter);
    }
    const rawResults = await lanceQuery.execute();
    const mapped = rawResults.map(convertRawDBResultToRagnoteDBEntry);
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
    const mapped = rawResults.map(convertRawDBResultToRagnoteDBEntry);
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

export const maybeRePopulateTable = async (
  table: RagnoteTable,
  directoryPath: string,
  fileExtensions?: string[]
) => {
  const count = await table.countRows();
  const filesInfo = GetFilesInfo(directoryPath);
  if (count !== filesInfo.length) {
    await deleteAllRowsInTable(table);
    await populateDBWithFilesInDir(table, directoryPath, fileExtensions);
  }
};
const deleteAllRowsInTable = async (db: RagnoteTable) => {
  try {
    await db.delete(`${DatabaseFields.CONTENT} != ''`);
    await db.delete(`${DatabaseFields.CONTENT} = ''`);
  } catch (error) {
    console.error("Error deleting rows:", error);
  }
};

// so we want a function to convert files to dbEntry types (which will involve chunking later on)
const convertFileTypeToDBType = (file: FileInfo): RagnoteDBEntry => {
  return {
    notepath: file.path,
    content: readFile(file.path),
    subnoteindex: 0,
    timeadded: new Date(),
  };
};

const populateDBWithFilesInDir = async (
  db: RagnoteTable,
  directoryPath: string,
  fileExtensions?: string[]
) => {
  const filesInfo = GetFilesInfo(directoryPath); // TODO: deprecate
  const entries: RagnoteDBEntry[] = await Promise.all(
    filesInfo.map(convertFileTypeToDBType)
  );

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

// function getFileNamesInDirectory( // TODO: modify this to the tree structure/use the other get files function
//   directoryPath: string,
//   extensions?: string[]
// ): string[] {
//   const files = fs.readdirSync(directoryPath);
//   if (!extensions) {
//     return files;
//   }

//   return files.filter((file) => {
//     const fileExtension = path.extname(file);
//     return extensions.includes(fileExtension);
//   });
// }

function convertToRecord(entry: RagnoteDBEntry): Record<string, unknown> {
  const recordEntry: Record<string, unknown> = entry as unknown as Record<
    string,
    unknown
  >;
  return recordEntry;
}

function convertRawDBResultToRagnoteDBEntry(
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
