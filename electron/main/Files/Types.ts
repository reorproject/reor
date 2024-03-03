export type FileInfo = {
  name: string;
  path: string;
  relativePath: string;
  dateModified: Date;
  dateCreated: Date;
};

export type FileInfoNode = FileInfo & {
  children?: FileInfoNode[];
};

export type FileInfoTree = FileInfoNode[];

export const isFileNodeDirectory = (fileInfo: FileInfoNode): boolean => {
  return fileInfo.children !== undefined;
};
