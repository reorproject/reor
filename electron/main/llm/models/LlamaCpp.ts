/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIModelConfig } from "electron/main/Store/storeConfig";
import { ISendFunctionImplementer, ISessionService } from "../Types";

export class LlamaCPPSessionService implements ISessionService {
  private session: any;
  private context: any;
  private model: any; // Model instance
  public activeContextSize?: number;

  async init(storeModelConfig: AIModelConfig): Promise<void> {
    // try {

    await this.loadModel(storeModelConfig.localPath);
    if (!this.isModelLoaded()) {
      throw new Error("Model not loaded");
    }

    this.activeContextSize = chooseRightContextSize(
      this.model.trainContextSize,
      storeModelConfig.contextLength
    );
    // console.log("ACTIVE CONTEXT SIZE:", this.activeContextSize);
    console.log(
      "MODEL: this.model.trainContextSize",
      this.model.trainContextSize
    );
    const nodeLLamaCpp = await import("node-llama-cpp");
    this.context = new nodeLLamaCpp.LlamaContext({
      model: this.model,
      contextSize: 2048, // so for now, this doesn't do much to prevent context crashes
    });
    this.session = new nodeLLamaCpp.LlamaChatSession({
      contextSequence: this.context.getSequence(),
    });
    // this.session = new nodeLLamaCpp.LlamaChatSession({
    //   context: this.context,
    // });
    // } catch (error) {
    //   console.error("Error thrown in initi:", error);
    //   throw error; // Re-throw the error to propagate it up
    // }
  }

  private async loadModel(localModelPath: string): Promise<void> {
    // try {
    const nodeLLamaCpp = await import("node-llama-cpp");
    this.model = new nodeLLamaCpp.LlamaModel({
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

  public tokenize(text: string): number[] {
    return this.session.model.tokenize(text);
    // return this.context.encode(text);
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

const chooseRightContextSize = (
  modelContextSize: number,
  storeContextSize?: number
): number | undefined => {
  if (!modelContextSize) {
    return storeContextSize;
  }
  if (
    storeContextSize &&
    storeContextSize > 0 &&
    storeContextSize < modelContextSize
  ) {
    return storeContextSize;
  }
  return modelContextSize;
};
