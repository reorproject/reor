import React from 'react'
import { useCompletion } from 'ai/react'
import { ArrowUp, Sparkles, ShrinkIcon, ExpandIcon, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AiEditMenuProps {
  selectedText: string
  onEdit: (newText: string) => void
}

const AiEditMenu = ({ selectedText, onEdit }: AiEditMenuProps) => {
  const { complete } = useCompletion({
    api: '/api/generate',
  })

  const handleAction = async (action: string) => {
    const prompt = `${action} the following text: ${selectedText}`
    const completion = await complete(prompt)
    if (completion) {
      onEdit(completion)
    }
  }

  return (
    <Card className="w-[400px] border-gray-800 bg-[#1a1b1e]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-purple-500" />
          <CardTitle className="text-sm text-gray-300">Ask AI to edit or generate...</CardTitle>
        </div>
        <Button size="icon" variant="ghost" className="text-purple-500">
          <ArrowUp className="size-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Edit or review selection</p>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-gray-800"
              onClick={() => handleAction('improve')}
            >
              <Sparkles className="mr-2 size-5 text-purple-500" />
              Improve writing
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-gray-800"
              onClick={() => handleAction('fix grammar in')}
            >
              Fix grammar
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-gray-800"
              onClick={() => handleAction('make shorter')}
            >
              <ShrinkIcon className="mr-2 size-5 text-purple-500" />
              Make shorter
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-gray-800"
              onClick={() => handleAction('make longer')}
            >
              <ExpandIcon className="mr-2 size-5 text-purple-500" />
              Make longer
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Use AI to do more</p>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
            <Play className="mr-2 size-5 text-purple-500" />
            Continue writing
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AiEditMenu
