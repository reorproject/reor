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
        // contextSize: 1024,
        // batchSize: 1,
      });
      this.session = new nodeLLamaCpp.LlamaChatSession({
        context: this.context,
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

    // this.model = await import("node-llama-cpp").then((nodeLLamaCpp: any) => {
    //   return new nodeLLamaCpp.LlamaModel({
    //     modelPath: path.join(
    //       os.homedir(),
    //       "Downloads",
    //       "tinyllama-2-1b-miniguanaco.Q2_K.gguf"
    //       // "mistral-7b-v0.1.Q4_K_M.gguf"
    //     ),
    //     gpuLayers: 0,
    //   });
    // });
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
      throw new Error("Session not initialized");
    }
    console.log("starting streaming prompt");
    return await this.session.prompt(prompt, {
      temperature: 0.8,
      topK: 40,
      topP: 0.02,
      onToken: (chunk: any[]) => {
        const decodedChunk = this.context.decode(chunk);
        console.log("decoded chunk: ", decodedChunk);
        sendFunctionImplementer.send("tokenStream", {
          messageType: "success",
          content: decodedChunk,
        });
      },
    });
  }
}
