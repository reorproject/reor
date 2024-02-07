/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIModelConfig } from "electron/main/Store/storeConfig";
import { ISendFunctionImplementer, ISessionService } from "../Types";

export class LlamaCPPSessionService implements ISessionService {
  private session: any;
  private context: any;
  private model: any;
  private abortController?: AbortController;
  private contextLength?: number;

  async init(storeModelConfig: AIModelConfig): Promise<void> {
    this.contextLength = storeModelConfig.contextLength;
    await this.loadModel(storeModelConfig.localPath);

    if (!this.isModelLoaded()) {
      throw new Error("Model not loaded");
    }

    const nodeLLamaCpp = await import("node-llama-cpp");
    this.context = await new nodeLLamaCpp.LlamaContext({
      model: this.model,
      contextSize: storeModelConfig.contextLength,
    });
    this.session = await new nodeLLamaCpp.LlamaChatSession({
      contextSequence: this.context.getSequence(),
      systemPrompt: "",
    });
  }

  public getContextLength(): number {
    return this.contextLength || 0;
  }

  private async loadModel(localModelPath: string): Promise<void> {
    // try {
    const nodeLLamaCpp = await import("node-llama-cpp");
    // const llama = await nodeLLamaCpp.getLlama();
    this.model = new nodeLLamaCpp.LlamaModel({
      // llama,
      modelPath: localModelPath,
      gpuLayers: getGPULayersToUse(),
    });
    // } catch (error) {
    //   console.log("Error:", JSON.stringify(error, null, 2));

    //   console.error("Error thrown in load model:", error);
    //   throw error; // Propagate the error up
    // }
  }

  private isModelLoaded(): boolean {
    return !!this.model;
  }

  public tokenize = (text: string): number[] => {
    return this.session.model.tokenize(text);
  };

  public abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined; // Reset the controller
    }
  }

  public async streamingPrompt(
    prompt: string,
    sendFunctionImplementer: ISendFunctionImplementer
  ): Promise<string> {
    if (!this.session && !this.context) {
      sendFunctionImplementer.send("tokenStream", {
        messageType: "error",
        content: "Session not initialized",
      });
      return "Session not initialized";
    }
    console.log("starting streaming prompt");
    this.abortController = new AbortController();

    try {
      const tokensInput = this.tokenize(prompt);
      console.log("tokensInput:", tokensInput.length);
      return await this.session.prompt(prompt, {
        onToken: (chunk: any[]) => {
          // const decodedChunk = this.context.decode(chunk);
          const decodedChunk = this.session.model.detokenize(chunk);
          // const encodedDecode = this.context.encode(decodedChunk);
          // console.log("ENCODED :", encodedDecode);
          console.log("chunk out: ", chunk);
          console.log("decodedChunk:", decodedChunk);
          sendFunctionImplementer.send("tokenStream", {
            messageType: "success",
            content: decodedChunk,
          });
        },
        signal: this.abortController.signal,
      });
    } catch (err) {
      sendFunctionImplementer.send("tokenStream", {
        messageType: "error",
        content: errorToString(err),
      });
      return "";
    }
  }
}

export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    // Use toString() method for Error objects
    return error.toString();
  } else {
    // Convert other types of errors to string
    return String(error);
  }
}

const getGPULayersToUse = (): number => {
  if (process.platform === "darwin" && process.arch === "arm64") {
    return 100; // NOTE: Will use fewer GPU layers if the model has fewer layers.
  }
  return 0;
};
