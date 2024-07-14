export const addCollapsibleDetailsInMarkdown = (content: string, title: string, FILE_REFERENCE_DELIMITER: string) =>
  // <span/> is required to demarcate the start of collapsible details from the markdown line
  `${FILE_REFERENCE_DELIMITER} <span/> <details> <summary> *${title.trim()}* </summary> \n ${content} </details>`
