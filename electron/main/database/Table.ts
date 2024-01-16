import { Connection, Table as LanceDBTable, Query } from "vectordb";
import GetOrCreateLanceTable from "./Lance";
import { DatabaseFields } from "./Schema";
import {
  EnhancedEmbeddingFunction,
  createEmbeddingFunction,
} from "./Embeddings";
import {
  GetFilesInfoList,
  flattenFileInfoTree,
  readFile,
} from "../Files/Filesystem";
import { FileInfo, FileInfoTree } from "../Files/Types";
import { chunkMarkdownByHeadings } from "../RAG/Chunking";

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
        // Handle the error as needed, e.g., break the loop, retry, etc.
        // Example: break; // to exit the loop
      }
      index++;
      const progress = index / totalChunks;
      if (onProgress) {
        onProgress(progress);
      }
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

export const repopulateTableWithMissingItems = async (
  table: LanceDBTableWrapper,
  directoryPath: string,
  extensionsToFilterFor: string[],
  onProgress?: (progress: number) => void
) => {
  const filesInfoList = GetFilesInfoList(directoryPath, extensionsToFilterFor);
  const tableArray = await getTableAsArray(table);
  const dbItemsToAdd = computeDbItemsToAdd(filesInfoList, tableArray, table);
  if (dbItemsToAdd.length == 0) {
    console.log("no items to add");
    onProgress && onProgress(1);
    return;
  }
  const filePathsToDelete = dbItemsToAdd.map((x) => x[0].notepath);
  const quotedFilePaths = filePathsToDelete
    .map((filePath) => `'${filePath}'`)
    .join(", ");

  // Now use the quoted file paths in your query string
  const filterString = `${DatabaseFields.NOTE_PATH} IN (${quotedFilePaths})`;
  await table.delete(filterString);
  const flattenedItemsToAdd = dbItemsToAdd.flat();
  await table.add(flattenedItemsToAdd, onProgress);
  onProgress && onProgress(1);
};

const getTableAsArray = async (table: LanceDBTableWrapper) => {
  const totalRows = await table.countRows();
  if (totalRows == 0) {
    return [];
  }
  const nonEmptyResults = await table.filter(
    `${DatabaseFields.CONTENT} != ''`,
    totalRows
  );
  const emptyResults = await table.filter(
    `${DatabaseFields.CONTENT} = ''`,
    totalRows
  );
  const results = nonEmptyResults.concat(emptyResults);
  return results;
};

const computeDbItemsToAdd = (
  filesInfoList: FileInfo[],
  tableArray: DBEntry[],
  table: LanceDBTableWrapper
): DBEntry[][] => {
  return filesInfoList
    .map(convertFileTypeToDBType)
    .filter((listOfChunks) =>
      filterChunksNotInTable(listOfChunks, tableArray, table)
    );
};

const filterChunksNotInTable = (
  listOfChunks: DBEntry[],
  tableArray: DBEntry[],
  table: LanceDBTableWrapper
): boolean => {
  if (listOfChunks.length == 0) {
    return false;
  }
  if (listOfChunks[0].content == "") {
    return false;
  }
  const notepath = listOfChunks[0].notepath;
  const itemsAlreadyInTable = tableArray.filter(
    (item) => item.notepath == notepath
  );
  return listOfChunks.length != itemsAlreadyInTable.length;
};

const deleteAllRowsInTable = async (db: LanceDBTableWrapper) => {
  try {
    await db.delete(`${DatabaseFields.CONTENT} != ''`);
    await db.delete(`${DatabaseFields.CONTENT} = ''`);
  } catch (error) {
    console.error("Error deleting rows:", error);
  }
};

const convertFileTreeToDBEntries = (tree: FileInfoTree): DBEntry[] => {
  const flattened = flattenFileInfoTree(tree);
  const entries = flattened.flatMap(convertFileTypeToDBType);
  return entries;
};

const convertFileTypeToDBType = (file: FileInfo): DBEntry[] => {
  const fileContent = readFile(file.path);
  const chunks = chunkMarkdownByHeadings(fileContent);
  const entries = chunks.map((content, index) => {
    return {
      notepath: file.path,
      content: content,
      subnoteindex: index,
      timeadded: new Date(),
    };
  });
  return entries;
};

export const addTreeToTable = async (
  dbTable: LanceDBTableWrapper,
  fileTree: FileInfoTree
): Promise<void> => {
  const dbEntries = convertFileTreeToDBEntries(fileTree);
  await dbTable.add(dbEntries);
};

export const removeTreeFromTable = async (
  dbTable: LanceDBTableWrapper,
  fileTree: FileInfoTree
): Promise<void> => {
  const flattened = flattenFileInfoTree(fileTree);
  const filePaths = flattened.map((x) => x.path);
  for (const filePath of filePaths) {
    await dbTable.delete(`${DatabaseFields.NOTE_PATH} = "${filePath}"`);
  }
};

export const updateFileInTable = async (
  dbTable: LanceDBTableWrapper,
  filePath: string,
  content: string
): Promise<void> => {
  // TODO: maybe convert this to have try catch blocks.
  await dbTable.delete(`${DatabaseFields.NOTE_PATH} = '${filePath}'`);
  const currentTimestamp: Date = new Date();
  const chunkedContentList = chunkMarkdownByHeadings(content);
  const dbEntries = chunkedContentList.map((content, index) => {
    return {
      notepath: filePath,
      content: content,
      subnoteindex: index,
      timeadded: currentTimestamp,
      // distance:
    };
  });
  await dbTable.add(dbEntries);
};

function convertLanceResultToDBResult(
  record: Record<string, unknown>
): DBResult | null {
  if (
    DatabaseFields.NOTE_PATH in record &&
    DatabaseFields.VECTOR in record &&
    DatabaseFields.CONTENT in record &&
    DatabaseFields.SUB_NOTE_INDEX in record &&
    DatabaseFields.TIME_ADDED in record &&
    DatabaseFields.DISTANCE in record
  ) {
    return record as unknown as DBResult;
  }
  return null;
}
