import { DatabaseFields } from "./Schema";
import {
  GetFilesInfoList,
  flattenFileInfoTree,
  readFile,
} from "../Files/Filesystem";
import { FileInfo, FileInfoTree } from "../Files/Types";
import { chunkMarkdownByHeadings } from "../RAG/Chunking";
import { DBEntry, DBResult, LanceDBTableWrapper } from "./LanceTableWrapper";

export const repopulateTableWithMissingItems = async (
  table: LanceDBTableWrapper,
  directoryPath: string,
  extensionsToFilterFor: string[],
  onProgress?: (progress: number) => void
) => {
  const filesInfoList = GetFilesInfoList(directoryPath, extensionsToFilterFor);
  const tableArray = await getTableAsArray(table);
  const dbItemsToAdd = computeDbItemsToAdd(filesInfoList, tableArray);
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

const computeDbItemsToAdd = (
  filesInfoList: FileInfo[],
  tableArray: DBEntry[]
): DBEntry[][] => {
  return filesInfoList
    .map(convertFileTypeToDBType)
    .filter((listOfChunks) => filterChunksNotInTable(listOfChunks, tableArray));
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

export function convertLanceResultToDBResult(
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
