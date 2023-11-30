import * as lancedb from "vectordb";
// import { Schema } from 'apache-arrow';
import CreateDatabaseSchema from "./Schema";
import { EnhancedEmbeddingFunction } from "./Transformers";

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
  const directoryPathAlias = userDirectory.replace(/[/\\]/g, "-");

  // so now we should check whether there is a limit on table name size...We should try to induce that error
  return `ragnote_table_${embeddingFuncName.replace(
    "/",
    "_"
  )}_${directoryPathAlias}`;
};

export default GetOrCreateLanceTable;
