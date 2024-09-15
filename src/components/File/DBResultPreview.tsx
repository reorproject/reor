import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import MarkdownRenderer from '../Common/MarkdownRenderer'

const cosineDistanceToPercentage = (similarity: number) => ((1 - similarity) * 100).toFixed(2)

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
  onSelect: (path: string) => void
}

export const DBSearchPreview: React.FC<DBSearchPreviewProps> = ({ dbResult: entry, onSelect }) => {
  const modified = formatModifiedDate(entry.filemodified)
  const fileName = getFileName(entry.notepath)

  return (
    <div
      className="mb-4 mt-0 max-w-full cursor-pointer overflow-hidden rounded border border-gray-600 bg-neutral-800 p-2 shadow-md transition-transform duration-300 hover:bg-neutral-500 hover:shadow-lg"
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
