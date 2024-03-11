import { listFiles, downloadFile } from "@huggingface/hub";
import fs from "fs";
import * as path from "path";
import { customFetchUsingElectronNet } from "../Generic/network";

export const DownloadModelFilesFromHFRepo = async (
  repo: string,
  saveDirectory: string,
  quantized = true
) => {
  // List the files:
  const fileList = await listFiles({
    repo: repo,
    recursive: true,
    fetch: customFetchUsingElectronNet,
  });

  const files = [];
  for await (const file of fileList) {
    if (file.type === "file") {
      if (file.path.endsWith("onnx")) {
        const isQuantizedFile = file.path.includes("quantized");
        if (quantized === isQuantizedFile) {
          files.push(file);
        }
      } else {
        files.push(file);
      }
    }
  }

  console.log("files: ", files);

  // Create an array of promises for each file download:
  const downloadPromises = files.map((file) =>
    downloadAndSaveFile(repo, file.path, path.join(saveDirectory, repo))
  );

  // Execute all download promises in parallel:
  await Promise.all(downloadPromises);
};

async function downloadAndSaveFile(
  repo: string,
  HFFilePath: string,
  systemFilePath: string
): Promise<void> {
  // Call the downloadFile function and await its result
  const res = await downloadFile({
    repo: repo,
    path: HFFilePath,
    fetch: customFetchUsingElectronNet,
  });

  if (!res) {
    throw new Error(`Failed to download file from ${repo}/${HFFilePath}`);
  }

  // Convert the Response object to an ArrayBuffer
  const arrayBuffer = await res.arrayBuffer();

  // Convert the ArrayBuffer to a Buffer
  const buffer = Buffer.from(arrayBuffer);

  // Join the systemFilePath and filePath to create the full path
  const fullPath = path.join(systemFilePath, HFFilePath);
  const directory = path.dirname(fullPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  // Save the Buffer to the full path
  fs.writeFileSync(fullPath, buffer);
  console.log(`Saved file to ${fullPath}`);
}
