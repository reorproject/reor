import { net, ClientRequestConstructorOptions } from "electron";
import { listFiles, downloadFile } from "@huggingface/hub";
import fs from "fs";
import * as path from "path";

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

export const customFetchUsingElectronNet = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  console.log("input: ", input);
  console.log("init: ", init);
  const url = input instanceof URL ? input.href : input.toString();
  const options = init || {};

  return new Promise((resolve, reject) => {
    const requestOptions: ClientRequestConstructorOptions = {
      method: options.method || "GET",
      url: url,
    };

    const request = net.request(requestOptions);

    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        request.setHeader(key, value as string);
      });
    }

    // Handle request body
    if (options.body) {
      let bodyData;
      if (options.body instanceof ArrayBuffer) {
        bodyData = Buffer.from(options.body);
      } else if (
        typeof options.body === "string" ||
        Buffer.isBuffer(options.body)
      ) {
        bodyData = options.body;
      } else if (typeof options.body === "object") {
        bodyData = JSON.stringify(options.body);
        request.setHeader("Content-Type", "application/json");
      } else {
        reject(new Error("Unsupported body type"));
        return;
      }
      request.write(bodyData);
    }

    request.on("response", (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk) => chunks.push(chunk as Buffer));
      response.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(
          new Response(buffer, {
            status: response.statusCode,
            statusText: response.statusMessage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            headers: new Headers(response.headers as any),
          })
        );
      });
    });

    request.on("error", (error) => reject(error));
    request.end();
  });
};
