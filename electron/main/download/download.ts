import { net, ClientRequestConstructorOptions } from "electron";
import { listFiles, downloadFile } from "@huggingface/hub";
import fs from "fs";
import * as path from "path";

async function downloadAndSaveFile(
  repo: string,
  HFFilePath: string,
  systemFilePath: string
): Promise<void> {
  // Call the downloadFile function and await its result
  const res = await downloadFile({
    repo: repo,
    path: HFFilePath,
    fetch: customFetch,
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
}

export const DownloadModelFilesFromHFRepo = async (
  repo: string,
  // path: string,
  saveDirectory: string
) => {
  // List the files:
  const fileList = await listFiles({
    repo: repo,
    // path: path,
    recursive: true,
    fetch: customFetch,
  });

  const files = [];
  for await (const file of fileList) {
    if (file.type === "file") {
      files.push(file);
    }
  }

  // Create an array of promises for each file download:
  const downloadPromises = files.map((file) =>
    downloadAndSaveFile(repo, file.path, path.join(saveDirectory, repo))
  );

  // Execute all download promises in parallel:
  await Promise.all(downloadPromises);
};

const customFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
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
      const headers = new Headers(options.headers);
      headers.forEach((value, key) => {
        request.setHeader(key, value);
      });
    }

    // Handle request body
    if (options.body) {
      let bodyData;
      if (options.body instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Buffer
        bodyData = Buffer.from(options.body);
      } else if (
        typeof options.body === "string" ||
        Buffer.isBuffer(options.body)
      ) {
        bodyData = options.body;
      } else {
        console.warn("Unsupported body type:", typeof options.body);
        reject(new Error("Unsupported body type"));
        return;
      }
      request.write(bodyData);
    }

    // Handle the response
    request.on("response", (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        resolve(
          new Response(body, {
            status: response.statusCode,
            statusText: response.statusMessage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            headers: new Headers(response.headers as any),
          })
        );
      });
    });

    // Handle request errors
    request.on("error", (error) => reject(error));

    // End the request
    request.end();
  });
};
