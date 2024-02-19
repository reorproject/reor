export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    // Use toString() method for Error objects
    return error.toString();
  } else {
    // Convert other types of errors to string
    return String(error);
  }
}
