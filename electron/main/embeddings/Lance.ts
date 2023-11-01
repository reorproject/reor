import * as lancedb from "vectordb";
// import { Schema } from 'apache-arrow';
import CreateRagnoteDBSchema from "./Schema";
import TransformersJSEmbedFun from "./Transformersjs";
import {
  Schema,
  Field,
  Utf8,
  FixedSizeList,
  Int16,
  Int32,
  Float32,
} from "apache-arrow";
// get or create a lancedb table

const GetOrCreateTable = async (
  db: lancedb.Connection,
  name: string
): Promise<lancedb.Table<string>> => {
  const tableNames = await db.tableNames();
  console.log("tableNames", tableNames);
  if (tableNames.includes(name)) {
    return db.openTable(name);
  }
  console.log("creating table");
  const newTable = db.createTable({
    name,
    schema: CreateRagnoteDBSchema(384),
    embeddingFunction: TransformersJSEmbedFun,
  });
  console.log("newTable", newTable);
  // console.log(newTable)
  return newTable;
};

// const GetOrCreateTable = async (
//   db: lancedb.Connection,
//   name: string
// ): Promise<lancedb.Table<string>> => {
//   const tableNames = await db.tableNames();
//   console.log("tableNames", tableNames);
//   if (tableNames.includes(name)) {
//     return db.openTable(name);
//   }
//   console.log("creating table");
//   const schema = CreateRagnoteDBSchema(384);
//   console.log("schema", schema);
//   const lanceTestSchema = new Schema([
//     new Field(
//       "vector",
//       new FixedSizeList(128, new Field("float32", new Float32()))
//     ),
//   ]);
//   console.log("lanceTestSchema", lanceTestSchema);
//   const pathField = Field.new({ name: "path", type: new Utf8() });
//   const contentField = Field.new({ name: "content", type: new Utf8() });
//   const subNoteIndexField = Field.new({
//     name: "subNoteIndex",
//     type: new Int32(),
//   });

//   // Combine them into a schema
//   const chatGPTSchema = new Schema([
//     pathField,
//     contentField,
//     subNoteIndexField,
//   ]);
//   // const newTable = await db.createTable({
//   //   name,
//   //   schema: chatGPTSchema,
//   const testSchema = new Schema([
//     new Field(
//       "vector",
//       new FixedSizeList(128, new Field("float32", new Float32()))
//     ),
//   ]);
//   const newTable = await db.createTable({
//     name: "vectors",
//     schema: testSchema,
//   });
//   // embeddingFunction: TransformersJSEmbedFun,
//   // });
//   console.log("newTable", newTable);
//   // console.log(newTable)
//   return newTable;
// };

export default GetOrCreateTable;

// so we create a function that generates our embedding function from the name alias
// from there, we get the dimension of vectors
