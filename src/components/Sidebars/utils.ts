const debounce = <F extends (...args: string[]) => Promise<void>>(
  func: F,
  delay: number,
): ((...args: Parameters<F>) => void) => {
  let debounceTimer: NodeJS.Timeout

  return (...args: Parameters<F>) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => func(...args), delay)
  }
}

export default debounce
