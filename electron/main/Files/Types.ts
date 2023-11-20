export interface FileInfo {
  name: string;
  path: string;
  relativePath: string;
  dateModified: Date;
  type: "file" | "directory";
  children?: FileInfo[];
}
