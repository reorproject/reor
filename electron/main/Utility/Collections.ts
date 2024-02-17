export function findKeyByValue(
  map: Map<string, number>,
  value: number
): string | null {
  for (const [key, val] of map.entries()) {
    if (val === value) {
      return key;
    }
  }
  return null; // Return null if no key found
}
