import { FileInfoNode } from 'electron/main/filesystem/types'
import { ReorChatMessage } from '@/lib/llm/types'

export const generateChatName = (messages: ReorChatMessage[], userInput?: string): string => {
  if (userInput) {
    return userInput.slice(0, 50)
  }
  if (!messages || messages.length === 0 || !messages[0].content) {
    return 'Empty Chat'
  }

  const firstMsg = messages[0]

  if (firstMsg.visibleContent) {
    return firstMsg.visibleContent.slice(0, 30)
  }

  const firstMessage = firstMsg.content
  if (!firstMessage || firstMessage === '' || typeof firstMessage !== 'string') {
    return 'Empty Chat'
  }
  return firstMessage.slice(0, 30)
}

export const isFileNodeDirectory = (fileInfo: FileInfoNode): boolean => fileInfo.children !== undefined
