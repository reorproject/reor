import {
  Schema,
  Field,
  Utf8,
  FixedSizeList,
  Int16,
  Float32,
} from "apache-arrow";

const CreateRagnoteDBSchema = (vectorDim: number) => {
  return new Schema([
    new Field("path", new Utf8()),
    new Field("content", new Utf8()),
    new Field("subNoteIndex", new Int16()),
    // TODO: maybe here we'll have like cluster details or something like that.
    // + also last modified and last saved date.
    // + we need to think about what other pieces of data could aid the RAG pipeline
    new Field(
      "vector",
      new FixedSizeList(vectorDim, new Field("float32", new Float32()))
    ),
  ]);
};

export default CreateRagnoteDBSchema;
