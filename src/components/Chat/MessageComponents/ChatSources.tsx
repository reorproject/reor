import React from 'react'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { Card, XStack, ScrollView, Stack } from 'tamagui'
import { useContentContext } from '@/contexts/ContentContext'
import Tooltip from '@/components/Editor/ui/src/tooltip'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'
import { useThemeManager } from '@/contexts/ThemeContext'

interface ChatSourcesProps {
  contextItems: FileInfoWithContent[] | DBEntry[]
}

export const truncateName = (name: string, maxLength: number) => {
  if (name.length <= maxLength) return name
  return `${name.slice(0, maxLength - 3)}...`
}

const ChatSources: React.FC<ChatSourcesProps> = ({ contextItems }) => {
  const { state } = useThemeManager()
  const { openContent } = useContentContext()

  const isDBEntry = (item: FileInfoWithContent | DBEntry): item is DBEntry => {
    return 'notepath' in item
  }

  const getItemName = (item: FileInfoWithContent | DBEntry) => {
    if (isDBEntry(item)) {
      return item.notepath.split('/').pop() || ''
    }
    return item.name
  }

  const getItemPath = (item: FileInfoWithContent | DBEntry) => {
    return isDBEntry(item) ? item.notepath : item.path
  }

  const getItemContent = (item: FileInfoWithContent | DBEntry) => {
    return item.content
  }

  const handleOpenContent = (path: string) => {
    openContent(path)
    posthog.capture('open_content_from_chat_sources')
  }

  if (contextItems.length === 0) {
    return null
  }

  return (
    <div>
      <div className="mb-1 text-sm text-muted-foreground">Sources:</div>

      <div
        className={`flex space-x-2 overflow-x-auto p-0 pb-1 scrollbar-thin scrollbar-track-transparent 
          ${state === 'light' ? 'scrollbar-thumb-gray-200' : 'scrollbar-thumb-gray-700'}`}
      >
        {contextItems.map((contextItem) => (
          <XStack key={getItemPath(contextItem)}>
            <Tooltip content={getItemContent(contextItem)} renderMarkdown placement="top">
              <Card
                cursor="pointer"
                overflow="hidden"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$borderColor"
                shadowColor="$gray7"
                shadowRadius="$2"
                px="$3"
                hoverStyle={{
                  shadowRadius: '$4',
                }}
                width="100%"
                onPress={() => handleOpenContent(getItemPath(contextItem))}
              >
                <ScrollView maxHeight="100px">
                  <MarkdownRenderer content={truncateName(getItemName(contextItem), 20)} />
                </ScrollView>
              </Card>
            </Tooltip>
          </XStack>
        ))}
      </div>
    </div>
  )
}

export default ChatSources
