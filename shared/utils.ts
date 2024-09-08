import { ReorChatMessage } from '@/components/Chat/types'

const getDisplayableChatName = (messages: ReorChatMessage[]): string => {
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

export default getDisplayableChatName
