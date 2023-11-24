export interface StoreSchema {
  user: {
    directory?: string;
    preferences?: {
      // ... other preferences
    };
  };
  // ... other top-level keys
}

// Enum for store keys
export enum StoreKeys {
  UserDirectory = "user.directory",
  UserPreferences = "user.preferences",
  // ... other keys
}

// Create a strongly-typed store instance
