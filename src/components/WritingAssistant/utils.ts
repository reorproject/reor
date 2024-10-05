import { ReorChatMessage } from '../../lib/llm/types'

function getClassNames(message: ReorChatMessage | undefined): string {
  if (!message) {
    return 'bg-blue-100 text-blue-800'
  }
  if (message.role === 'assistant') {
    return 'bg-neutral-200 text-black'
  }
  return 'bg-blue-100 text-blue-800'
}

export const generatePromptString = (
  option: string,
  selectedText: string,
  isSpaceTrigger: boolean,
  customPromptInput?: string,
): string => {
  let processedText = selectedText
  if (!selectedText.trim() && isSpaceTrigger) {
    processedText = ''
  }

  switch (option) {
    case 'simplify':
      return `The following text in triple quotes below has already been written:
    """
    ${processedText}
    """
    Simplify and condense the writing. Do not return anything other than the simplified writing. Do not wrap responses in quotes.`
    case 'copy-editor':
      return `Act as a copy editor. Go through the text in triple quotes below. Edit it for spelling mistakes, grammar issues, punctuation, and generally for readability and flow. Format the text into appropriately sized paragraphs. Make your best effort.
    
    """ ${processedText} """
    Return only the edited text. Do not wrap your response in quotes. Do not offer anything else other than the edited text in the response. Do not translate the text. If in doubt, or you can't make edits, just return the original text.`
    case 'takeaways':
      return `My notes are below in triple quotes:
    """ ${processedText} """
    Write a markdown list (using dashes) of key takeaways from my notes. Write at least 3 items, but write more if the text requires it. Be very detailed and don't leave any information out. Do not wrap responses in quotes.`
    default:
      if (processedText.trim() === '') {
        return `The user has given the following instructions(in triple #)  ### ${customPromptInput} ###`
      }
      return (
        'The user has given the following instructions(in triple #) for processing the text selected(in triple quotes): ' +
        `### ${customPromptInput} ###` +
        '\n' +
        `  """ ${processedText} """`
      )
  }
}

export const getLastMessage = (messages: ReorChatMessage[], optionalRole?: string): ReorChatMessage | undefined => {
  if (messages.length === 0) return undefined
  if (!optionalRole) return messages[messages.length - 1]
  const outputMessages = messages.filter((msg) => msg.role === optionalRole)
  return outputMessages[outputMessages.length - 1]
}

export default getClassNames
