import { ReorChatMessage } from '../Chat/utils'

function getClassNames(message: ReorChatMessage) {
  if (message.messageType === 'error') {
    return 'bg-red-100 text-red-800'
  }
  if (message.role === 'assistant') {
    return 'bg-neutral-200 text-black'
  }
  return 'bg-blue-100 text-blue-800'
}

export default getClassNames
