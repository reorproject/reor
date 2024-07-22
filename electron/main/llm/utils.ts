import { MessageParam } from '@anthropic-ai/sdk/resources'
import { ChatCompletionMessageParam } from 'openai/resources'

function cleanMessageForAnthropic(message: ChatCompletionMessageParam): MessageParam {
  if (typeof message.content !== 'string') {
    throw new Error('Message content is not a string')
  }
  if (message.role === 'system') {
    return { role: 'user', content: message.content }
  }
  if (message.role === 'user' || message.role === 'assistant') {
    return { role: message.role, content: message.content }
  }
  throw new Error('Message role is not valid')
}

export default cleanMessageForAnthropic
