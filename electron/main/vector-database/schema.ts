import {
  Schema,
  Field,
  Utf8,
  FixedSizeList,
  Float32,
  Float64,
  DateUnit,
  Date_ as ArrowDate,
} from "apache-arrow";

export interface DBEntry {
  notepath: string;
  vector: Float32Array;
  content: string;
  subnoteindex: number;
  timeadded: Date;
  filemodified: Date;
  filecreated: Date;
}

export interface DBQueryResult extends DBEntry {
  _distance: number;
}

export const chunksize = 500;

export enum DatabaseFields {
  NOTE_PATH = "notepath",
  VECTOR = "vector",
  CONTENT = "content",
  SUB_NOTE_INDEX = "subnoteindex",
  TIME_ADDED = "timeadded",
  FILE_MODIFIED = "filemodified",
  FILE_CREATED = "filecreated",
  DISTANCE = "_distance",
}

type DatabaseSchema = Schema<{
  [DatabaseFields.NOTE_PATH]: Utf8;
  [DatabaseFields.VECTOR]: FixedSizeList;
  [DatabaseFields.CONTENT]: Utf8;
  [DatabaseFields.SUB_NOTE_INDEX]: Float64;
  [DatabaseFields.TIME_ADDED]: ArrowDate;
  [DatabaseFields.FILE_MODIFIED]: ArrowDate;
  [DatabaseFields.FILE_CREATED]: ArrowDate;
}>;

const CreateDatabaseSchema = (vectorDim: number): DatabaseSchema => {
  const schemaFields: Field[] = [
    new Field(DatabaseFields.NOTE_PATH, new Utf8(), false),
    new Field(
      DatabaseFields.VECTOR,
      new FixedSizeList(vectorDim, new Field("item", new Float32())),
      false
    ),
    new Field(DatabaseFields.CONTENT, new Utf8(), false),
    new Field(DatabaseFields.SUB_NOTE_INDEX, new Float64(), false),
    new Field(
      DatabaseFields.TIME_ADDED,
      new ArrowDate(DateUnit.MILLISECOND),
      false
    ),
    new Field(
      DatabaseFields.FILE_MODIFIED,
      new ArrowDate(DateUnit.MILLISECOND),
      false
    ),
    new Field(
      DatabaseFields.FILE_CREATED,
      new ArrowDate(DateUnit.MILLISECOND),
      false
    ),
  ];
  return new Schema(schemaFields) as DatabaseSchema;
};

const serializeSchema = (schema: DatabaseSchema): string => {
  return JSON.stringify(
    schema.fields.map((field) => ({
      name: field.name,
      type: field.type.toString(),
      nullable: field.nullable,
    }))
  );
};

export const isStringifiedSchemaEqual = (
  schema1: DatabaseSchema,
  schema2: DatabaseSchema
): boolean => {
  const serializedSchema1 = serializeSchema(schema1);
  const serializedSchema2 = serializeSchema(schema2);
  return serializedSchema1 === serializedSchema2;
};

export default CreateDatabaseSchema;