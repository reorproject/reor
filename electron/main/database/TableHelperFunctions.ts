import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";
import {
  GetFilesInfoList,
  flattenFileInfoTree,
  readFile,
} from "../Files/Filesystem";
import { FileInfo, FileInfoTree } from "../Files/Types";
import { chunkMarkdownByHeadingsAndByCharsIfBig } from "../RAG/Chunking";
import { LanceDBTableWrapper } from "./LanceTableWrapper";

export const RepopulateTableWithMissingItems = async (
  table: LanceDBTableWrapper,
  directoryPath: string,
  onProgress?: (progress: number) => void
) => {
  const filesInfoTree = GetFilesInfoList(directoryPath);
  const tableArray = await getTableAsArray(table);
  const itemsToRemove = await computeDBItemsToRemoveFromTable(
    filesInfoTree,
    tableArray
  );
  const filePathsToRemove = itemsToRemove.map((x) => x.notepath);
  await table.deleteDBItemsByFilePaths(filePathsToRemove);

  const dbItemsToAdd = await computeDbItemsToAdd(filesInfoTree, tableArray);
  if (dbItemsToAdd.length == 0) {
    onProgress && onProgress(1);
    return;
  }
  const filePathsToDelete = dbItemsToAdd.map((x) => x[0].notepath);
  await table.deleteDBItemsByFilePaths(filePathsToDelete);

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

const computeDbItemsToAdd = async (
  filesInfoList: FileInfo[],
  tableArray: DBEntry[]
): Promise<DBEntry[][]> => {
  const promises = filesInfoList.map(convertFileTypeToDBType);

  const filesAsChunksToAddToDB = await Promise.all(promises);

  return filesAsChunksToAddToDB.filter((chunksBelongingToFile) =>
    filterChunksNotInTable(chunksBelongingToFile, tableArray)
  );
};

const computeDBItemsToRemoveFromTable = async (
  filesInfoList: FileInfo[],
  tableArray: DBEntry[]
): Promise<DBEntry[]> => {
  const notInFilesInfoList = tableArray.filter(
    (item) => !filesInfoList.some((file) => file.path == item.notepath)
  );
  return notInFilesInfoList;
};

const filterChunksNotInTable = (
  chunksBelongingToFile: DBEntry[],
  tableArray: DBEntry[]
): boolean => {
  if (chunksBelongingToFile.length == 0) {
    return false;
  }
  if (chunksBelongingToFile[0].content == "") {
    return false;
  }
  const notepath = chunksBelongingToFile[0].notepath;
  const itemsAlreadyInTable = tableArray.filter(
    (item) => item.notepath == notepath
  );
  return chunksBelongingToFile.length != itemsAlreadyInTable.length;
};

const convertFileTreeToDBEntries = async (
  tree: FileInfoTree
): Promise<DBEntry[]> => {
  const flattened = flattenFileInfoTree(tree);

  const promises = flattened.map(convertFileTypeToDBType);

  const entries = await Promise.all(promises);

  return entries.flat();
};

const convertFileTypeToDBType = async (file: FileInfo): Promise<DBEntry[]> => {
  const fileContent = readFile(file.path);
  const chunks = await chunkMarkdownByHeadingsAndByCharsIfBig(fileContent);
  const entries = chunks.map((content, index) => {
    return {
      notepath: file.path,
      content: content,
      subnoteindex: index,
      timeadded: new Date(),
      filemodified: file.dateModified,
    };
  });
  return entries;
};

export function sanitizePathForDatabase(filePath: string): string {
  return filePath.replace(/'/g, "''");
}

export function unsanitizePathForFileSystem(dbPath: string): string {
  return dbPath.replace(/''/g, "'");
}

export const addTreeToTable = async (
  dbTable: LanceDBTableWrapper,
  fileTree: FileInfoTree
): Promise<void> => {
  const dbEntries = await convertFileTreeToDBEntries(fileTree);
  await dbTable.add(dbEntries);
};

export const removeTreeFromTable = async (
  dbTable: LanceDBTableWrapper,
  fileTree: FileInfoTree
): Promise<void> => {
  const flattened = flattenFileInfoTree(fileTree);
  const filePaths = flattened.map((x) => x.path);
  await dbTable.deleteDBItemsByFilePaths(filePaths);
};

export const updateFileInTable = async (
  dbTable: LanceDBTableWrapper,
  filePath: string,
  onUpdateSuccess: () => void // Adding a callback function parameter
): Promise<void> => {
  try {
    await dbTable.deleteDBItemsByFilePaths([filePath]);
    const currentTimestamp: Date = new Date();
    const content = readFile(filePath);
    if (content == "") {
      return;
    }
    const chunkedContentList = await chunkMarkdownByHeadingsAndByCharsIfBig(
      content
    );
    const dbEntries = chunkedContentList.map((content, index) => {
      return {
        notepath: filePath,
        content: content,
        subnoteindex: index,
        timeadded: currentTimestamp,
        filemodified: currentTimestamp,
      };
    });
    console.log("db entries: ", dbEntries.length);
    await dbTable.add(dbEntries);

    // Call the callback function after successful update
    onUpdateSuccess();
  } catch (error) {
    console.error("Non-breaking error updating file in table:", error);
  }
};

export const deleteFilesFromTable = async (
  dbTable: LanceDBTableWrapper,
  filePaths: string[],
  onUpdateSuccess: () => void // Adding a callback function parameter
): Promise<void> => {
  try {
    await dbTable.deleteDBItemsByFilePaths(filePaths);

    // Call the callback function after successful update
    onUpdateSuccess();
  } catch (error) {
    console.error("Non-breaking error deleting files from table:", error);
  }
};

export function convertLanceEntryToDBEntry(
  record: Record<string, unknown>
): DBEntry | null {
  if (
    DatabaseFields.NOTE_PATH in record &&
    DatabaseFields.VECTOR in record &&
    DatabaseFields.CONTENT in record &&
    DatabaseFields.SUB_NOTE_INDEX in record &&
    DatabaseFields.TIME_ADDED in record
  ) {
    const recordAsDBQueryType = record as unknown as DBEntry;
    recordAsDBQueryType.notepath = unsanitizePathForFileSystem(
      recordAsDBQueryType.notepath
    );
    return recordAsDBQueryType;
  }
  return null;
}

export function convertLanceResultToDBResult(
  record: Record<string, unknown>
): DBQueryResult | null {
  if (
    DatabaseFields.NOTE_PATH in record &&
    DatabaseFields.VECTOR in record &&
    DatabaseFields.CONTENT in record &&
    DatabaseFields.SUB_NOTE_INDEX in record &&
    DatabaseFields.TIME_ADDED in record &&
    DatabaseFields.DISTANCE in record
  ) {
    const recordAsDBQueryType = record as unknown as DBQueryResult;
    recordAsDBQueryType.notepath = unsanitizePathForFileSystem(
      recordAsDBQueryType.notepath
    );
    return recordAsDBQueryType;
  }
  return null;
}
