export type FileInfo = {
  name: string;
  path: string;
  relativePath: string;
  dateModified: Date;
};

export type FileInfoNode = FileInfo & {
  children?: FileInfoNode[];
};

export type FileInfoTree = FileInfoNode[];

// So the type of this thing. Each item is a FileInfo and then to make it into a tree we add in a decorator that says whether it's a file or a directory
// but perhaps we don't need that decorator. And we can just make a function that is like isDirectory

export const isFileNodeDirectory = (fileInfo: FileInfoNode): boolean => {
  return fileInfo.children !== undefined;
};
