import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface SuggestionCardProps {
  suggestion: string
  onClick: () => void
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onClick }) => (
  <Card
    className="cursor-pointer border border-solid border-border transition-colors duration-200 hover:bg-accent"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground">{suggestion}</p>
    </CardContent>
  </Card>
)

export default SuggestionCard
