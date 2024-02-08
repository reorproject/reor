import { DBEntry, DBQueryResult, DatabaseFields } from "./Schema";
import {
  GetFilesInfoList,
  flattenFileInfoTree,
  readFile,
} from "../Files/Filesystem";
import { FileInfo, FileInfoTree } from "../Files/Types";
import { chunkMarkdownByHeadingsAndByCharsIfBig } from "../RAG/Chunking";
import { LanceDBTableWrapper } from "./LanceTableWrapper";

export const repopulateTableWithMissingItems = async (
  table: LanceDBTableWrapper,
  directoryPath: string,
  onProgress?: (progress: number) => void
) => {
  const filesInfoTree = GetFilesInfoList(directoryPath);
  console.log("got files info list: ", filesInfoTree.length);
  if (filesInfoTree.length > 0) {
    console.log("files info tree length: ", filesInfoTree[0]);
  }
  const tableArray = await getTableAsArray(table);
  console.log("got table as array: " + tableArray.length);
  if (tableArray.length > 0) {
    console.log("table array length: ", tableArray[0]);
  }
  const dbItemsToAdd = await computeDbItemsToAdd(filesInfoTree, tableArray);
  console.log("got db items to add: ", dbItemsToAdd.length);
  if (dbItemsToAdd.length > 0) {
    console.log("db items to add length: ", dbItemsToAdd[0]);
  }
  if (dbItemsToAdd.length == 0) {
    console.log("no items to add");
    onProgress && onProgress(1);
    return;
  }
  const filePathsToDelete = dbItemsToAdd.map((x) => x[0].notepath);
  console.log("deleting db items by file paths: ", filePathsToDelete.length);
  if (filePathsToDelete.length > 0) {
    console.log("file paths to delete length: ", filePathsToDelete[0]);
  }
  await table.deleteDBItemsByFilePaths(filePathsToDelete);
  console.log("done deleting");

  const flattenedItemsToAdd = dbItemsToAdd.flat();
  console.log("flattened items to add: ", flattenedItemsToAdd.length);
  if (flattenedItemsToAdd.length > 0) {
    console.log("flattened items to add length: ", flattenedItemsToAdd[0]);
  }
  await table.add(flattenedItemsToAdd, onProgress);
  console.log("done adding");
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

  const convertedItems = await Promise.all(promises);

  return convertedItems.filter((listOfChunks) =>
    filterChunksNotInTable(listOfChunks, tableArray)
  );
};

const filterChunksNotInTable = (
  listOfChunks: DBEntry[],
  tableArray: DBEntry[]
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

const convertFileTreeToDBEntries = async (
  tree: FileInfoTree
): Promise<DBEntry[]> => {
  const flattened = flattenFileInfoTree(tree);

  // Map each file info to a promise using the async function
  const promises = flattened.map(convertFileTypeToDBType);

  // Wait for all promises to resolve
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
  content: string
): Promise<void> => {
  await dbTable.deleteDBItemsByFilePaths([filePath]);
  const currentTimestamp: Date = new Date();
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
  await dbTable.add(dbEntries);
};

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
