import path from "path";

export function addExtensionToFilenameIfNoExtensionPresent(
  filename: string,
  extension: string
): string {
  const trimmedFilename = filename.trim();
  const trimmedExtension = extension.trim();

  if (!trimmedFilename || !trimmedExtension) {
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
