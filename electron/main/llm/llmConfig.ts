import { LLMConfig } from "../Store/storeConfig";

export function validateAIModelConfig(config: LLMConfig): string | null {
  // Validate localPath: ensure it's not empty
  if (!config.modelName.trim()) {
    return "Model name is required.";
  }

  // Validate contextLength: ensure it's a positive number
  if (config.contextLength && config.contextLength <= 0) {
    return "Context length must be a positive number.";
  }

  // Validate engine: ensure it's either "openai" or "llamacpp"
  if (config.engine !== "openai" && config.engine !== "llamacpp") {
    return "Engine must be either 'openai' or 'llamacpp'.";
  }
  if (
    config.type == "local" &&
    !config.localPath &&
    !config.localPath?.trim()
  ) {
    return "Local path is required.";
  }

  // Optional field validation for errorMsg: ensure it's not empty if provided
  if (config.errorMsg && !config.errorMsg.trim()) {
    return "Error message should not be empty if provided.";
  }

  return null;
}
