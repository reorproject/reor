import path from "path";
import os from "os";
import { IModel, ISendFunctionImplementer, ISessionService } from "../Types";

export class LlamaCPPModelLoader implements IModel {
  private model: any;

  async loadModel(): Promise<void> {
    // Load model logic
    this.model = await import("node-llama-cpp").then((nodeLLamaCpp: any) => {
      return new nodeLLamaCpp.LlamaModel({
        modelPath: path.join(
          os.homedir(),
          "Downloads",
          "tinyllama-2-1b-miniguanaco.Q2_K.gguf"
          // "mistral-7b-v0.1.Q4_K_M.gguf"
        ),
        gpuLayers: 0,
      });
    });
  }

  public async getModel(): Promise<any> {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    return this.model;
  }

  async unloadModel(): Promise<void> {
    // Unload model logic
    this.model = null;
  }

  isModelLoaded(): boolean {
    return !!this.model;
  }
}

export class LlamaCPPSessionService implements ISessionService {
  private session: any;
  public context: any;
  private modelLoader: LlamaCPPModelLoader;

  constructor(modelLoader: LlamaCPPModelLoader) {
    this.modelLoader = modelLoader;
    this.init();
  }
  async init() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    import("node-llama-cpp").then(async (nodeLLamaCpp: any) => {
      const model = await this.modelLoader.getModel();
      this.context = new nodeLLamaCpp.LlamaContext({ model });
      this.session = new nodeLLamaCpp.LlamaChatSession({
        context: this.context,
      });
    });
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
        sendFunctionImplementer.send("tokenStream", decodedChunk);
      },
    });
  }
}
