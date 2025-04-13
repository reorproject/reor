import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import { Card, Text, YStack, Stack } from 'tamagui'
import MarkdownRenderer from '../Common/MarkdownRenderer'

const cosineDistanceToPercentage = (similarity: number) => {
  // Ensure we show at least 1% similarity
  const percentage = (1 - similarity) * 100
  return percentage < 1 ? '1.00' : percentage.toFixed(2)
}

export function getFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/)
  return parts.pop() || ''
}

const formatModifiedDate = (date: Date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return ''
  }
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

interface DBResultPreviewProps {
  dbResult: DBQueryResult
  onSelect: (path: string) => void
}

export const DBResultPreview: React.FC<DBResultPreviewProps> = ({ dbResult: entry, onSelect }) => {
  const modified = formatModifiedDate(entry.filemodified)
  const fileName = getFileName(entry.notepath)

  return (
    <Stack
      mt={0}
      width="100%"
      cursor="pointer"
      overflow="hidden"
      backgroundColor="$gray3"
      hoverStyle={{
        backgroundColor: '$gray5',
      }}
      borderRadius="$1"
      borderWidth={0.1}
      borderColor="$gray7"
      paddingHorizontal="$2"
      paddingVertical="$1"
      onPress={() => onSelect(entry.notepath)}
    >
      <Stack width="100%">
        <Text fontSize="sm" color="$gray11">
          <MarkdownRenderer content={entry.content} />
        </Text>
      </Stack>
      <div className="mt-2 text-xs">
        {fileName && <span className="text-xs text-gray-400">{fileName} </span>} | Similarity:{' '}
        {/* eslint-disable-next-line no-underscore-dangle */}
        {cosineDistanceToPercentage(entry._distance)}% |{' '}
        {modified && <span className="text-xs text-gray-400">Modified {modified}</span>}
      </div>
    </Stack>
  )
}

interface DBSearchPreviewProps {
  dbResult: DBQueryResult
  onSelect: (path: string) => void
}

export const DBSearchPreview: React.FC<DBSearchPreviewProps> = ({ dbResult: entry, onSelect }) => {
  const modified = formatModifiedDate(entry.filemodified)
  const fileName = getFileName(entry.notepath)

  return (
    <Card
      marginBottom="$4"
      marginTop="$0"
      maxWidth="100%"
      cursor="pointer"
      overflow="hidden"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      padding="$2"
      shadowColor="$gray7"
      shadowRadius="$2"
      hoverStyle={{
        shadowRadius: '$4',
      }}
      onPress={() => onSelect(entry.notepath)}
    >
      <YStack>
        <Text fontSize="$2" color="$colorLight">
          <MarkdownRenderer content={entry.content} />
        </Text>
        <Text marginTop="$2" fontSize="$1" color="$colorMuted">
          {fileName && (
            <Text fontSize="$1" color="$colorMuted">
              {fileName}{' '}
            </Text>
          )}{' '}
          | Similarity: {cosineDistanceToPercentage(entry._distance)}% |{' '}
          {modified && (
            <Text fontSize="$1" color="$colorMuted">
              Modified {modified}
            </Text>
          )}
        </Text>
      </YStack>
    </Card>
  )
}
