export type FileInfo = {
  name: string;
  path: string;
  relativePath: string;
  dateModified: Date;
};

export type FileInfoNode = FileInfo & {
  type: "file" | "directory";
  children?: FileInfoNode[];
};

export type FileInfoTree = FileInfoNode[];

// So maybe we just need an abstraction to help deal with transitions between a tree and a list.

// And we could extend the FileInfoNode to basically extend the file type.

// Yes that's what we'll have to do.
