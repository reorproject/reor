import * as lancedb from "vectordb";
// import { Schema } from 'apache-arrow';
import CreateDatabaseSchema from "./Schema";
import { EnhancedEmbeddingFunction } from "./Embeddings";

const GetOrCreateLanceTable = async (
  db: lancedb.Connection,
  embedFunc: EnhancedEmbeddingFunction<string>,
  userDirectory: string
): Promise<lancedb.Table<string>> => {
  const allTableNames = await db.tableNames();
  const tableName = generateTableName(embedFunc.name, userDirectory);
  // console.log("tableNames", tableNames);
  if (allTableNames.includes(tableName)) {
    // await db.dropTable(tableName);
    return db.openTable(tableName, embedFunc);
  }

  const newTable = await db.createTable({
    name: tableName,
    schema: CreateDatabaseSchema(embedFunc.contextLength),
    embeddingFunction: embedFunc,
  });
  // console.log("newTable", newTable);
  // console.log(newTable)
  return newTable;
};

export const generateTableName = (
  embeddingFuncName: string,
  userDirectory: string
): string => {
  const sanitizeForFileSystem = (str: string) => {
    return str.replace(/[<>:"/\\|?*]/g, "_");
  };

  const directoryPathAlias = sanitizeForFileSystem(userDirectory);
  const sanitizedEmbeddingFuncName = sanitizeForFileSystem(embeddingFuncName);

  return `ragnote_table_${sanitizedEmbeddingFuncName}_${directoryPathAlias}`;
};

export default GetOrCreateLanceTable;
