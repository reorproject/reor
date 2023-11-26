export interface StoreSchema {
  user: {
    directory?: string;
    preferences?: {
      // ... other preferences
    };
    openAIAPIKey?: string;
  };
  // ... other top-level keys
}

// Enum for store keys
export enum StoreKeys {
  UserDirectory = "user.directory",
  UserPreferences = "user.preferences",
  UserOpenAIAPIKey = "user.openAIAPIKey",
}

// Create a strongly-typed store instance
