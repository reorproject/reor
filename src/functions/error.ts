export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    // It's an Error object
    return error.message;
  } else if (typeof error === "string") {
    // If error is already a string, return as is
    return error;
  } else {
    // For other types, convert to string for logging
    return `Unhandled error type: ${String(error)}`;
  }
}
