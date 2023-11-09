import {
  createRepo,
  uploadFiles,
  deleteFile,
  deleteRepo,
  listFiles,
  listModels,
  whoAmI,
  downloadFile,
  RepoDesignation,
} from "@huggingface/hub";
// import fs from "fs";
// import * as path from "path";

import { promisify } from "util";
import { pipeline } from "stream";

import { writeFile } from "fs/promises";
// import { Blob } from "node-fetch";
import fs from "fs";
import * as path from "path";

// `response` is the Response object from your question
// async function saveResponseToFile(response: Response, filePath: string) {
//     // Check if the response is ok (status in the range 200-299)
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     // Check if there's a body in the response
//     if (response.body) {
//       // Read the response body as a stream
//       const reader = response.body.getReader();

//       let chunks: Uint8Array[] = [];
//       let done, value;
//       while (({ done, value } = await reader.read()) && !done) {
//         chunks.push(value);
//       }

//       // Concatenate the chunks into a single Uint8Array
//       let data = new Uint8Array(chunks.reduce((acc, val) => acc.concat(Array.from(val)), []));

//       // Write the data to a file
//       await writeFile(filePath, data);

//       console.log(`File written to ${filePath}`);
//     } else {
//       // Handle the case where there's no body
//       console.log('Response had no body to save.');
//     }
//   }

// Async function to list all files

// async function downloadAndSaveFile(
//   repo: string,
//   filePath: string,
//   systemFilePath: string
// ): Promise<void> {
//   // Call the downloadFile function and await its result
//   const res = await downloadFile({
//     repo: repo,
//     path: filePath,
//   });

//   if (!res) {
//     throw new Error(`Failed to download file from ${repo}/${filePath}`);
//   } // Convert the Response object to a Blob
//   const blob = await res.blob();

//   // Create a new File object from the Blob
//   // Create a new File object from the Blob
//   const file = new File([blob], filePath);

//   // Join the systemFilePath and filePath to create the full path
//   const fullPath = path.join(systemFilePath, filePath);

//   // Save the File object to the full path
//   fs.writeFileSync(fullPath, file);
// }

async function downloadAndSaveFile(
  repo: string,
  filePath: string,
  systemFilePath: string
): Promise<void> {
  // Call the downloadFile function and await its result
  const res = await downloadFile({
    repo: repo,
    path: filePath,
  });

  if (!res) {
    throw new Error(`Failed to download file from ${repo}/${filePath}`);
  }

  // Convert the Response object to an ArrayBuffer
  const arrayBuffer = await res.arrayBuffer();

  // Convert the ArrayBuffer to a Buffer
  const buffer = Buffer.from(arrayBuffer);

  // Join the systemFilePath and filePath to create the full path
  const fullPath = path.join(systemFilePath, filePath);
  const directory = path.dirname(fullPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  // Save the Buffer to the full path
  fs.writeFileSync(fullPath, buffer);
}

export const testDownload = async () => {
  // first let's list the files:
  const fileList = await listFiles({
    repo: "Xenova/all-MiniLM-L6-v2",
    // path: "onnx",
    recursive: true,
  });
  let files = [];
  for await (let file of fileList) {
    if (file.type === "file") {
      files.push(file);
    }
  }

  console.log(files);
  console.log("FILES", files);

  // call downloadAndSaveFile for each file
  for await (let file of files) {
    await downloadAndSaveFile(
      "Xenova/all-MiniLM-L6-v2",
      file.path,
      "/Users/sam/Desktop/vite-ragnote/all-mini-model"
    );
  }
  // downloadAndSaveFile(
  //   "Xenova/jina-embeddings-v2-base-en",
  //   "config.json",
  //   "/Users/sam/Desktop/vite-ragnote/testdownloads"
  // );
};
