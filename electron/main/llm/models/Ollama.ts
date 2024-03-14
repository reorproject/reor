/* eslint-disable @typescript-eslint/no-unused-vars */
import { LLMSessionService } from "../Types";
import { Tiktoken, TiktokenModel, encodingForModel } from "js-tiktoken";
import {
  LLMGenerationParameters,
  OpenAILLMConfig,
} from "electron/main/Store/storeConfig";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { app } from "electron";
import * as path from "path";
import * as os from "os";
import { spawn } from "child_process";
// import ollama,"ollama";
import { ModelResponse } from "ollama";

export class OllamaService implements LLMSessionService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client!: any;

  constructor() {
    // this.client = await import("ollama");
    // this.client = new ollama.Client();
  }

  public init = async () => {
    console.log("Initializing Ollama client...");
    try {
      this.serve();
    } catch (e) {
      console.error("Error starting Ollama server: ", e);
    }
    this.client = await import("ollama");
    console.log("Ollama client: ", this.client);
    // const models = await this.client.default.list();
    // console.log("Ollama models: ", models);
    // const lists = await this.client.
    // console.log("Ollama models: ", lists);
  };

  private serve = async () => {
    let exePath: string;
    let exeName: string;
    switch (process.platform) {
      case "win32":
        exeName = "ollama.exe";
        exePath = app.isPackaged
          ? path.join(process.resourcesPath, "binaries")
          : path.join(app.getAppPath(), "binaries", "win32");
        break;
      case "darwin":
        exeName = "ollama-darwin";
        exePath = app.isPackaged
          ? path.join(process.resourcesPath, "binaries")
          : path.join(app.getAppPath(), "binaries", "darwin");
        break;
      case "linux":
        exeName = "ollama-linux";
        exePath = app.isPackaged
          ? path.join(process.resourcesPath, "binaries")
          : path.join(app.getAppPath(), "binaries", "linux");
        break;
      default:
        throw new Error("Unsupported platform");
    }
    const exe = path.join(exePath, exeName);
    console.log("app path: ", app.getAppPath());
    console.log("resources path: ", process.resourcesPath);
    console.log("dirname is: ", __dirname);
    console.log("Starting Ollama server with: ", exe);
    const child = spawn(exe, ["serve"]);
    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  };

  public getAvailableModels = async (): Promise<OpenAILLMConfig> => {
    const ollamaModelsResponse = await this.client.default.list();

    const output = ollamaModelsResponse.models.map((model: ModelResponse) => {
      return {
        type: "openai",
        contextLength: 2048,
        engine: "openai",
        apiURL: "http://127.0.0.1:11434",
      };
    });
    return output;
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

  async streamingResponse(
    modelName: string,
    modelConfig: OpenAILLMConfig,
    messageHistory: ChatCompletionMessageParam[],
    handleChunk: (chunk: ChatCompletionChunk) => void,
    generationParams?: LLMGenerationParameters
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
