import path from "path";
import os from "os";
// import * as nodeLLamaCpp from "node-llama-cpp";

export class ModelLoader {
  private model: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    import("node-llama-cpp")
      .then((nodeLLamaCpp: any) => {
        try {
          this.model = new nodeLLamaCpp.LlamaModel({
            modelPath: path.join(
              os.homedir(),
              "Downloads",
              "tinyllama-2-1b-miniguanaco.Q2_K.gguf"
            ),
            gpuLayers: 0,
          });
        } catch (error) {
          console.error("Error initializing LlamaModel:", error);
          // Handle or throw the error further if needed
        }
      })
      .catch((error) => {
        console.error("Error importing node-llama-cpp:", error);
        // Handle or throw the error further if needed
      });
  }

  public async getModel(): Promise<any> {
    if (!this.model) {
      throw new Error("Model not initialized");
    }
    return this.model;
  }
}

export class SessionService {
  private session: any;
  public context: any;
  private modelLoader: ModelLoader;
  public webContents: Electron.WebContents;

  constructor(modelLoader: ModelLoader, webContents: Electron.WebContents) {
    this.modelLoader = modelLoader;
    this.webContents = webContents;
    this.init();
  }
  private async init() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    import("node-llama-cpp").then(async (nodeLLamaCpp: any) => {
      const model = await this.modelLoader.getModel();
      const context = new nodeLLamaCpp.LlamaContext({ model });
      this.context = context;
      this.session = new nodeLLamaCpp.LlamaChatSession({ context });
    });
  }

  public async streamingPrompt(prompt: string): Promise<string> {
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
        this.webContents.send("tokenStream", decodedChunk);
      },
    });
  }
}
