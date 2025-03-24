import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import removeMd from 'remove-markdown'
import MarkdownRenderer from '../Common/MarkdownRenderer'

const cosineDistanceToPercentage = (similarity: number) => {
  // Ensure we show at least 1% similarity
  const percentage = (1 - similarity) * 100
  return percentage < 1 ? '1.00' : percentage.toFixed(2)
}

const getFileName = (path: string) => {
  if (!path) return null
  const parts = path.split('/')
  return parts[parts.length - 1]
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
    <div
      className="mt-0 max-w-full cursor-pointer overflow-hidden rounded border-[0.1px] border-solid border-gray-600 bg-neutral-800 px-2 py-1 text-slate-300 shadow-md transition-transform duration-300 hover:bg-neutral-700 hover:shadow-lg"
      onClick={() => onSelect(entry.notepath)}
    >
      <div className="text-sm text-gray-200">
        <MarkdownRenderer content={entry.content} />
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {fileName && <span className="text-xs text-gray-400">{fileName} </span>} | Similarity:{' '}
        {/* eslint-disable-next-line no-underscore-dangle */}
        {cosineDistanceToPercentage(entry._distance)}% |{' '}
        {modified && <span className="text-xs text-gray-400">Modified {modified}</span>}
      </div>
    </div>
  )
}

interface DBSearchPreviewProps {
  dbResult: DBQueryResult
  onSelect: (path: string, content: string) => void
}

export const DBSearchPreview: React.FC<DBSearchPreviewProps> = ({ dbResult: entry, onSelect }) => {
  const modified = formatModifiedDate(entry.filemodified)
  const fileName = getFileName(entry.notepath)

  const handleClick = () => {
    // First extract the title from the content if possible
    const lines = removeMd(entry.content).split('\n')
    let textToFind = ''

    // Try to find the title/heading line (usually at the beginning)
    const firstFewLines = lines.slice(0, 5)
    const titleLine = firstFewLines.find((line) => {
      const trimmed = line.trim()
      return trimmed && trimmed.length > 3 && trimmed.length < 100
    })

    if (titleLine) {
      textToFind = titleLine.trim()
    } else {
      // If no title found, use the first non-empty line with reasonable length
      const firstGoodLine = lines.find((line) => {
        const trimmed = line.trim()
        return trimmed && trimmed.length > 5 && trimmed.length < 120
      })

      if (firstGoodLine) {
        textToFind = firstGoodLine.trim()
      } else {
        // If still no good text found, use first few words of content
        const plainText = removeMd(entry.content).trim()
        textToFind = plainText.substring(0, Math.min(50, plainText.length))
      }
    }

    onSelect(entry.notepath, textToFind)
  }

  return (
    <div
      className="mb-4 mt-0 max-w-full cursor-pointer overflow-hidden rounded border border-gray-600 bg-neutral-800 p-2 shadow-md transition-transform duration-300 hover:bg-neutral-700 hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="text-sm text-gray-200">
        <MarkdownRenderer content={entry.content} />
      </div>
      <div className="mt-2 text-xs text-gray-400">
        {fileName && <span className="text-xs text-gray-400">{fileName} </span>} | Similarity:{' '}
        {/* eslint-disable-next-line no-underscore-dangle */}
        {cosineDistanceToPercentage(entry._distance)}% |{' '}
        {modified && <span className="text-xs text-gray-400">Modified {modified}</span>}
      </div>
    </div>
  )
}
