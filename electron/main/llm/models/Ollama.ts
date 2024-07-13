/* eslint-disable @typescript-eslint/no-unused-vars */
import { exec, ChildProcess } from "child_process";
import * as os from "os";
import * as path from "path";

import { app } from "electron";
import {
  LLMGenerationParameters,
  OpenAILLMConfig,
} from "electron/main/electron-store/storeConfig";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import { ModelResponse, ProgressResponse, Ollama } from "ollama";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

// import ollama,"ollama";

import { LLMSessionService } from "../types";
import { error } from "@material-tailwind/react/types/components/input";

const OllamaServeType = {
  SYSTEM: "system", // ollama is installed on the system
  PACKAGED: "packaged", // ollama is packaged with the app
};

export class OllamaService implements LLMSessionService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client!: Ollama;
  private host = "http://127.0.0.1:11434";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private childProcess: ChildProcess | null = null;

  public init = async () => {
    console.log("Initializing Ollama client...");
    await this.serve();

    const ollamaLib = await import("ollama");
    this.client = new ollamaLib.Ollama();
  };

  async ping() {
    const response = await fetch(this.host, {
      method: "GET",
      cache: "no-store",
    });

    if (response.status !== 200) {
      throw new Error(`failed to ping ollama server: ${response.status}`);
    }

    return true;
  }

  async serve() {
    try {
      await this.ping();
      return OllamaServeType.SYSTEM;
    } catch (err) {
      // this is fine, we just need to start ollama
    }

    try {
      // See if 'ollama serve' command is available on the system
      await this.execServe("ollama");
      console.log("Ollama is installed on the system");
      return OllamaServeType.SYSTEM;
    } catch (err) {
      // ollama is not installed, run the binary directly
      console.log("Ollama is not installed on the system: ", err);
      // logInfo(`/ is not installed on the system: ${err}`);
    }

    let exeName = "";
    let exeDir = "";
    switch (process.platform) {
      case "win32":
        exeName = "ollama-windows-amd64.exe";
        exeDir = app.isPackaged
          ? path.join(process.resourcesPath, "binaries")
          : path.join(app.getAppPath(), "binaries", "win32");

        break;
      case "darwin":
        exeName = "ollama-darwin";
        exeDir = app.isPackaged
          ? path.join(process.resourcesPath, "binaries")
          : path.join(app.getAppPath(), "binaries", "darwin");
        break;
      case "linux":
        exeName = "ollama-linux-amd64";
        exeDir = app.isPackaged
          ? path.join(process.resourcesPath, "binaries")
          : path.join(app.getAppPath(), "binaries", "linux");

        break;
      default:
        throw new Error("Unsupported platform");
    }
    const exePath = path.join(exeDir, exeName);
    try {
      await this.execServe(exePath);
      return OllamaServeType.PACKAGED;
    } catch (err) {
      console.log("Failed to start Ollama: ", err);
      throw new Error(`Failed to start Ollama: ${err as string}`);
    }
  }

  async execServe(path: string) {
    return new Promise((resolve, reject) => {
      const env = { ...process.env };
      const command = `"${path}" serve`;

      this.childProcess = exec(command, { env }, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }

        if (stderr) {
          reject(new Error(`ollama stderr: ${stderr}`));
          return;
        }

        reject(new Error(`ollama stdout: ${stdout}`));
      });

      // Once the process is started, try to ping Ollama server.
      this.waitForPing()
        .then(() => {
          resolve(void 0);
        })
        .catch((pingError: error) => {
          if (this.childProcess && !this.childProcess.killed) {
            this.childProcess.kill();
          }
          reject(new Error(`Failed to ping Ollama server: ${pingError}`));
        });
    });
  }

  async waitForPing(delay = 1000, retries = 20) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.ping();
        return;
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries reached. Ollama server didn't respond.");
  }

  stop() {
    if (!this.childProcess) {
      return;
    }

    if (os.platform() === "win32") {
      exec(`taskkill /pid ${this.childProcess.pid} /f /t`, (err) => {
        if (err) {
          console.log("Failed to kill Ollama process: ", err);
        }
      });
    } else {
      this.childProcess.kill();
    }
    console.log("Ollama process killed");
    this.childProcess = null;
  }

  public getAvailableModels = async (): Promise<OpenAILLMConfig[]> => {
    const ollamaModelsResponse = await this.client.list();

    const output = ollamaModelsResponse.models.map(
      (model: ModelResponse): OpenAILLMConfig => {
        return {
          modelName: model.name,
          type: "openai",
          apiKey: "",
          contextLength: 4096,
          engine: "openai",
          apiURL: "http://localhost:11434/v1/",
        };
      }
    );
    return output;
  };

  public pullModel = async (
    modelName: string,
    handleProgress: (chunk: ProgressResponse) => void
  ): Promise<void> => {
    console.log("Pulling model: ", modelName);
    const stream = await this.client.pull({
      model: modelName,
      stream: true,
    });
    for await (const progress of stream) {
      handleProgress(progress);
    }
  };

  public deleteModel = async (modelName: string): Promise<void> => {
    await this.client.delete({ model: modelName });
  };

  public getTokenizer = (llmName: string): ((text: string) => number[]) => {
    let tokenEncoding: Tiktoken;
    try {
      tokenEncoding = encodingForModel(llmName as TiktokenModel);
    } catch (e) {
      tokenEncoding = encodingForModel("gpt-3.5-turbo-1106"); // hack while we think about what to do with custom remote models' tokenizers
    }
    const tokenize = (text: string): number[] => {
      return tokenEncoding.encode(text);
    };
    return tokenize;
  };

  public abort(): void {
    throw new Error("Abort not yet implemented.");
  }

  streamingResponse(
    _modelName: string,
    _modelConfig: OpenAILLMConfig,
    _isJSONMode: boolean,
    _messageHistory: ChatCompletionMessageParam[],
    _handleChunk: (chunk: ChatCompletionChunk) => void,
    _generationParams?: LLMGenerationParameters
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
