import path from "path";

export function addExtensionToFilenameIfNoExtensionPresent(
  filename: string,
  extension: string
): string {
  const trimmedFilename = filename.trim();
  const trimmedExtension = extension.trim();
  if (!trimmedFilename) {
    throw new Error("Filename is required");
  }
  if (!trimmedExtension) {
    return trimmedFilename;
  }

  const currentExtension = path.extname(trimmedFilename);

  if (!currentExtension) {
    return `${trimmedFilename}.${
      trimmedExtension.startsWith(".")
        ? trimmedExtension.slice(1)
        : trimmedExtension
    }`;
  }

  return trimmedFilename;
}
