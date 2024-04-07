export interface BasePromptRequirements {
  query: string;
  llmName: string;
  filePathToBeUsedAsContext?: string;
}
