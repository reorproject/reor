import {
  Schema,
  Field,
  Utf8,
  FixedSizeList,
  Int16,
  Float32,
  Float64,
  Timestamp,
  TimeUnit,
  DateUnit,
  Date_ as ArrowDate,
} from "apache-arrow";

const CreateRagnoteDBSchema = (vectorDim: number) => {
  const schema = new Schema([
    new Field("path", new Utf8(), false),
    new Field(
      "vector",
      new FixedSizeList(vectorDim, new Field("item", new Float32())),
      false
    ),
    new Field("content", new Utf8(), false),
    new Field("subNoteIndex", new Float64(), false),
    new Field("timeAdded", new ArrowDate(DateUnit.MILLISECOND), false),
  ]);
  return schema;
  // return new Schema([
  //   new Field("path", new Utf8()),
  //   new Field("content", new Utf8()),
  //   new Field("subNoteIndex", new Int16()),
  //   // TODO: maybe here we'll have like cluster details or something like that.
  //   // + also last modified and last saved date.
  //   // + we need to think about what other pieces of data could aid the RAG pipeline
  //   new Field(
  //     "vector",
  //     new FixedSizeList(384, new Field("item", new Float32())),
  //     false
  //   ),
  // ]);
};

export default CreateRagnoteDBSchema;
