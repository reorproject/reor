// import { parentPort } from "worker_threads";
import * as workers from "worker_threads";
import { pipeline } from "@xenova/transformers";

let pipe;
let embedFunc;
let tokenize;

async function initializePipeline(repoName) {
  // Assuming this function initializes your pipeline and stores it in the `pipe` variable
  // Similar to your initial setup, but inside the worker
  pipe = await pipeline("feature-extraction", repoName, {
    /* env settings */
  });
  embedFunc = await setupEmbedFunction(pipe);
  tokenize = await setupTokenizeFunction(pipe.tokenizer);
}

workers.parentPort.on("message", async (task) => {
  try {
    console.log("Received task", task);
    // Common response structure including task ID
    const response = { id: task.id, success: true };

    if (task.type === "initialize") {
      await initializePipeline(task.repoName);
      console.log("Pipeline initialized");
      workers.parentPort.postMessage({ ...response });
    } else if (task.type === "embed") {
      // Perform embedding
      if (!pipe) throw new Error("Pipeline not initialized");
      const result = await embedFunc(task.data); // Simplified for illustration
      workers.parentPort.postMessage({ ...response, result });
    } else if (task.type === "tokenize") {
      // Perform tokenization
      if (!pipe) throw new Error("Pipeline not initialized");
      const result = await tokenize(task.data); // Simplified for illustration
      workers.parentPort.postMessage({ ...response, result });
    } else if (task.type === "contextLength") {
      // Perform context length retrieval
      if (!pipe) throw new Error("Pipeline not initialized");
      const result = pipe.model.config.hidden_size; // Simplified for illustration
      workers.parentPort.postMessage({ ...response, result });
    }
  } catch (error) {
    // Include the task ID in error responses as well
    workers.parentPort.postMessage({
      id: task.id,
      success: false,
      error: error.message,
    });
  }
});

async function setupEmbedFunction(pipe) {
  return async (batch) => {
    // if (!Array.isArray(batch) || batch.length === 0 || batch[0].length === 0) {
    //   return [];
    // }

    if (typeof batch[0][0] === "number") {
      return batch;
    }

    if (!pipe) {
      throw new Error("Pipeline not initialized");
    }

    const result = [];
    for (let i = 0; i < batch.length; i++) {
      try {
        const text = batch[i];
        const res = await pipe(text, {
          pooling: "mean",
          normalize: true,
        });
        result.push(Array.from(res.data));
      } catch (error) {
        throw new Error(`Embedding process failed for text: error}`);
      }
    }

    return result;
  };
}

function setupTokenizeFunction(tokenizer) {
  return (data) => {
    if (!tokenizer) {
      throw new Error("Tokenizer not initialized");
    }

    return data.map((text) => {
      try {
        const res = tokenizer(text);
        return res;
      } catch (error) {
        throw new Error(`Tokenization process failed for text: ${error}`);
      }
    });
  };
}
