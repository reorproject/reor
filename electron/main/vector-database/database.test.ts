import {
  sanitizePathForDatabase,
  unsanitizePathForFileSystem,
} from './tableHelperFunctions';

describe('Path Sanitization Tests', () => {
  it('should sanitize file path correctly', () => {
    const unixPath = "/home/user/test'file.txt";
    const sanitized = sanitizePathForDatabase(unixPath);
    expect(sanitized).toBe("/home/user/test''file.txt");
  });
});

describe('Path Unsanitization Tests', () => {
  it('should unsanitize  path correctly', () => {
    const sanitizedPath = "/home/user/test''file.txt";
    const original = unsanitizePathForFileSystem(sanitizedPath);
    expect(original).toBe("/home/user/test'file.txt");
  });
});
