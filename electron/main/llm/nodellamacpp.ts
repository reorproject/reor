import path from "path";
// import * as nodeLLamaCpp from "node-llama-cpp";

export class ModelLoader {
  private model: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    import("node-llama-cpp").then(async (nodeLLamaCpp: any) => {
      this.model = new nodeLLamaCpp.LlamaModel({
        modelPath: path.join(
          "/Users/sam/Downloads/tinyllama-2-1b-miniguanaco.Q2_K.gguf"
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

  public async getHello(): Promise<string> {
    if (!this.session) {
      throw new Error("Session not initialized");
    }
    return await this.session.prompt(
      "Tell me in detail about the roman empire. Provide at least a paragraph."
    );
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
        console.log("undecoded chunk: ", chunk);
        const decodedChunk = this.context.decode(chunk);
        console.log("decodedChunk", decodedChunk);
        this.webContents.send("tokenStream", decodedChunk);
      },
    });
  }
}
