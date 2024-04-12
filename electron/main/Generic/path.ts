import path from "path";

export function addExtensionToFilenameIfNoExtensionPresent(
  filename: string,
  acceptableExtensions: string[],
  defaultExtension: string
): string {
  const extension = path.extname(filename).slice(1).toLowerCase();

  if (acceptableExtensions.includes(extension)) {
    return filename;
  }
  console.log("filename: ", filename, "defaultExtension: ", defaultExtension);
  return `${filename}${defaultExtension}`;
}
