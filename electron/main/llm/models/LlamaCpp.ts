/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISendFunctionImplementer, ISessionService } from "../Types";

export class LlamaCPPSessionService implements ISessionService {
  private session: any;
  public context: any;
  private model: any; // Model instance

  constructor(localModelPath: string) {
    this.init(localModelPath);
  }

  async init(localModelPath: string): Promise<void> {
    await this.loadModel(localModelPath);
    if (!this.isModelLoaded()) {
      throw new Error("Model not loaded");
    }

    import("node-llama-cpp").then(async (nodeLLamaCpp: any) => {
      this.context = new nodeLLamaCpp.LlamaContext({
        model: this.model,
        contextSize: this.model.trainContextSize(),
      });
      this.session = new nodeLLamaCpp.LlamaChatSession({
        contextSequence: this.context.getSequence(),
      });
    });
  }

  private async loadModel(localModelPath: string): Promise<void> {
    // Load model logic - similar to what was in LlamaCPPModelLoader
    const nodeLLamaCpp = await import("node-llama-cpp");
    this.model = new nodeLLamaCpp.LlamaModel({
      modelPath: localModelPath,
      gpuLayers: 0,
    });
  }

  private async unloadModel(): Promise<void> {
    // Unload model logic
    this.model = null;
  }

  private isModelLoaded(): boolean {
    return !!this.model;
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

    try {
      return await this.session.prompt(prompt, {
        temperature: 0.8,
        topK: 40,
        topP: 0.02,
        onToken: (chunk: any[]) => {
          const decodedChunk = this.model.detokenize(chunk);
          sendFunctionImplementer.send("tokenStream", {
            messageType: "success",
            content: decodedChunk,
          });
        },
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

function errorToString(error: unknown): string {
  if (error instanceof Error) {
    // Use toString() method for Error objects
    return error.toString();
  } else {
    // Convert other types of errors to string
    return String(error);
  }
}
