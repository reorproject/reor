import * as fs from "fs";
import * as path from "path";

import * as tmp from "tmp";

import { GetFilesInfoTree } from "./Filesystem";

describe("GetFilesInfoTree", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = tmp.dirSync({ unsafeCleanup: true }).name;
  });

  afterEach(() => {
    fs.rmdirSync(tempDir, { recursive: true });
  });

  it("should handle empty directories", () => {
    const result = GetFilesInfoTree(tempDir);
    expect(result).toEqual([]);
  });

  it("should correctly map a single file", () => {
    const filename = "test.md";
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, "Test content");
    const result = GetFilesInfoTree(tempDir);
    console.log("result", result);
    expect(result).toEqual([
      {
        name: filename,
        path: filePath,
        relativePath: filename,
        dateModified: expect.anything(),
        dateCreated: expect.anything(),
        // children: undefined,
      },
    ]);
    // expect(result[0].dateModified).toBeInstanceOf(Date);
  });

  it("should correctly map nested directories and files", () => {
    const dirName = "nested";
    const nestedDirPath = path.join(tempDir, dirName);
    fs.mkdirSync(nestedDirPath);

    const filename = "nestedFile.md";
    const nestedFilePath = path.join(nestedDirPath, filename);
    fs.writeFileSync(nestedFilePath, "Nested test content");

    const result = GetFilesInfoTree(tempDir);

    expect(result).toEqual([
      {
        name: dirName,
        path: nestedDirPath,
        relativePath: "nested",
        dateModified: expect.anything(),
        dateCreated: expect.anything(),
        children: [
          {
            name: filename,
            path: nestedFilePath,
            relativePath: path.join(dirName, filename),
            dateModified: expect.anything(),
            dateCreated: expect.anything(),
            children: undefined,
          },
        ],
      },
    ]);
  });
});
