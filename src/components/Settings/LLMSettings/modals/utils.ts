import { ProgressResponse } from 'ollama'

const downloadPercentage = (progress: ProgressResponse): string => {
  // Check if `total` is 0, undefined, or not a number to avoid division by zero or invalid operations
  if (
    !progress.total ||
    Number.isNaN(progress.total) ||
    progress.total === 0 ||
    !progress.completed ||
    Number.isNaN(progress.completed)
  ) {
    // Depending on your logic, you might want to return 0, or handle this case differently
    return 'checking...'
  }

  const percentage = (100 * progress.completed) / progress.total

  return `${percentage.toFixed(2)}%`
}

export default downloadPercentage
