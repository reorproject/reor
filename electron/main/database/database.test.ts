import {
  sanitizePathForDatabase,
  unsanitizePathForFileSystem,
} from "./TableHelperFunctions";
describe("Path Sanitization Tests", () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

  afterEach(() => {
    // Restore the original platform after each test
    if (originalPlatform) {
      Object.defineProperty(process, "platform", originalPlatform);
    }
  });

  it("should sanitize Windows file path correctly", () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    const windowsPath = "C:\\Users\\User\\Documents\\test'file.txt";
    const sanitized = sanitizePathForDatabase(windowsPath);
    expect(sanitized).toBe("C:/Users/User/Documents/test''file.txt");
  });

  it("should sanitize Unix file path correctly", () => {
    Object.defineProperty(process, "platform", {
      value: "linux",
    });
    const unixPath = "/home/user/test'file.txt";
    const sanitized = sanitizePathForDatabase(unixPath);
    expect(sanitized).toBe("/home/user/test''file.txt");
  });
});

describe("Path Unsanitization Tests", () => {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");

  afterEach(() => {
    // Restore the original platform after each test
    if (originalPlatform) {
      Object.defineProperty(process, "platform", originalPlatform);
    }
  });

  it("should unsanitize Windows path correctly", () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    const sanitizedWindowsPath = "C:/Users/User/Documents/test''file.txt";
    const original = unsanitizePathForFileSystem(sanitizedWindowsPath);
    expect(original).toBe("C:\\Users\\User\\Documents\\test'file.txt");
  });

  it("should unsanitize Unix path correctly", () => {
    Object.defineProperty(process, "platform", {
      value: "linux",
    });
    const sanitizedUnixPath = "/home/user/test''file.txt";
    const original = unsanitizePathForFileSystem(sanitizedUnixPath);
    expect(original).toBe("/home/user/test'file.txt");
  });
});
