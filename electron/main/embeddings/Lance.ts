import * as lancedb from "vectordb";
// import { Schema } from 'apache-arrow';
import CreateDatabaseSchema from "./Schema";
import {
  EnhancedEmbeddingFunction,
  createEmbeddingFunction,
} from "./Transformers";
import os from "os";
import path from "path";
// get or create a lancedb table

const GetOrCreateLanceTable = async (
  db: lancedb.Connection,
  embedFunc: EnhancedEmbeddingFunction<string>
): Promise<lancedb.Table<string>> => {
  const allTableNames = await db.tableNames();
  const tableName = generateTableName(embedFunc.name);
  // console.log("tableNames", tableNames);
  if (allTableNames.includes(tableName)) {
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

const generateTableName = (embeddingFuncName: string): string => {
  return `ragnote_table_${embeddingFuncName.replace("/", "_")}`;
};

export default GetOrCreateLanceTable;
