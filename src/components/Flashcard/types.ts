import { z } from 'zod'

export const FlashcardQAPairSchema = z.object({
  question: z.string().describe('The question or prompt for the flashcard.'),
  answer: z.string().describe('The answer or explanation for the flashcard question.'),
})

export type FlashcardQAPair = z.infer<typeof FlashcardQAPairSchema>

export interface FlashcardQAPairUI extends FlashcardQAPair {
  isFlipped: boolean
}
