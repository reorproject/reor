import { Readable } from "stream";

import { IncomingMessage, net } from "electron";
import { ClientRequestConstructorOptions } from "electron/main";

// We need to override the fetch function to use electron's net module. This is because fetch doesn't use user system proxy settings.
// We then feed these functions into our OpenAI interfaces.

export const customFetchUsingElectronNet = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  let url: string;
  if (input instanceof URL) {
    url = input.href;
  } else if (typeof input === "string") {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    throw new Error("Invalid input type");
  }
  const options = init ?? {};

  return new Promise((resolve, reject) => {
    const requestOptions: ClientRequestConstructorOptions = {
      method: options.method ?? "GET",
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

    request.on("response", (response: IncomingMessage) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        const buffer = Buffer.concat(chunks);

        // Convert IncomingHttpHeaders to Headers
        const headers = new Headers();
        Object.entries(response.headers).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              headers.append(key, v);
            });
          } else {
            headers.set(key, value);
          }
        });

        resolve(
          new Response(buffer, {
            status: response.statusCode || 200,
            statusText: response.statusMessage || "",
            headers: headers,
          })
        );
      });
    });

    request.on("error", (error) => {
      reject(error);
    });
    request.end();
  });
};

export const customFetchUsingElectronNetStreaming = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  let url: string;
  if (input instanceof URL) {
    url = input.href;
  } else if (typeof input === "string") {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    throw new Error("Invalid input type");
  }
  const options = init ?? {};

  return new Promise((resolve, reject) => {
    const requestOptions: ClientRequestConstructorOptions = {
      method: options.method ?? "GET",
      url: url,
    };

    // Ignore the 'agent' property from 'init' as it's not relevant for Electron's net module
    if ("agent" in options) {
      delete options.agent;
    }

    const request = net.request(requestOptions);

    // Set headers, except for 'content-length' which will be set automatically
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== "content-length") {
          // Skip 'content-length'
          request.setHeader(key, value as string);
        }
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

    request.on("response", (response: IncomingMessage) => {
      const nodeStream = new Readable({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        read() {},
      });

      response.on("data", (chunk: Buffer) => {
        nodeStream.push(chunk);
      });

      response.on("end", () => {
        nodeStream.push(null); // Signal end of stream
      });

      response.on("error", (error: Error) => {
        nodeStream.destroy(error); // Handle stream errors
      });

      const webStream = nodeToWebStream(nodeStream);

      // Convert IncomingHttpHeaders to Headers
      const headers = new Headers();
      Object.entries(response.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            headers.append(key, v);
          });
        } else {
          headers.set(key, value);
        }
      });

      resolve(
        new Response(webStream, {
          status: response.statusCode || 200,
          statusText: response.statusMessage || "",
          headers: headers,
        })
      );
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
};

function nodeToWebStream(nodeStream: Readable): ReadableStream<Uint8Array> {
  let isStreamEnded = false;

  const webStream = new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on("data", (chunk: Buffer | Uint8Array) => {
        if (!isStreamEnded) {
          controller.enqueue(
            Buffer.isBuffer(chunk) ? new Uint8Array(chunk) : chunk
          );
        }
      });

      nodeStream.on("end", () => {
        if (!isStreamEnded) {
          isStreamEnded = true;
          controller.close();
        }
      });

      nodeStream.on("error", (err: Error) => {
        if (!isStreamEnded) {
          isStreamEnded = true;
          controller.error(err);
        }
      });
    },
    cancel(reason?: unknown) {
      // Handle any cleanup or abort logic here
      nodeStream.destroy(
        reason instanceof Error ? reason : new Error(String(reason))
      );
    },
  });

  return webStream;
}
