export function removeFileExtension(filename: string): string {
  if (!filename || filename.indexOf(".") === -1) {
    return filename;
  }

  if (filename.startsWith(".") && filename.lastIndexOf(".") === 0) {
    return filename;
  }

  return filename.substring(0, filename.lastIndexOf("."));
}

export function readableFileName(filename: string): string {
  return `-${removeFileExtension(filename)}`
    .replace(/-[a-z]/g, (str) => str.replace("-", " ").toUpperCase())
    .trim();
}

export const getInvalidCharacterInFileName = async (filename: string): Promise<string | null> => {
  let invalidCharacters: RegExp;
  const platform = await window.electron.getPlatform();

  switch (platform) {
    case 'win32':
      invalidCharacters = /["*/:<>?\\|]/;
      break;
    case 'darwin':
      invalidCharacters = /[/:]/;
      break;
    default:
      invalidCharacters = /[/]/;
      break;
  }

  const idx = filename.search(invalidCharacters);

  return idx === -1 ? null : filename[idx];
}

const charMap: { [key: string]: string } = {
  'ä': 'a', 'Ä': 'A', 'ö': 'o', 'Ö': 'O', 'ü': 'u', 'Ü': 'U',
  'ß': 'ss', 'é': 'e', 'è': 'e', 'ê': 'e', 'É': 'E', 'ë': 'e', 
  'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S',
  'α': 'a', 'β': 'b', 'γ': 'g', 'Γ': 'G', 'δ': 'd', 'Δ': 'D',
  'ε': 'e', 'ζ': 'z', 'η': 'h', 'θ': 'th', 'ι': 'i', 'κ': 'k',
  'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
  'ρ': 'r', 'σ': 's', 'τ': 't', 'υ': 'u', 'φ': 'f', 'χ': 'ch',
  'ç': 'c', 'Ç': 'C', 'ψ': 'ps', 'ω': 'o', ' ': '-',
};

export const sanitizeFilename = (fileName: string) => {
    // Remove invalid characters from the file name
    const sanitizedFileName = fileName.toLowerCase().split('').map(char => 
      charMap[char] || (/[a-z0-9\-]/.test(char) ? char : '')
    ).join('').trim();
    // Check if the sanitized filename is empty
    if (sanitizedFileName.length > 0) {
      // Limit the length of the filename (e.g., to 255 characters)
      const maxLength = 255;
      return sanitizedFileName.slice(0, maxLength).replace(/\\/g, "/");
    }
    return '';
};