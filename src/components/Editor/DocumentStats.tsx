import React, { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'

interface DocumentStatsProps {
  editor: Editor | null
}

const DocumentStats: React.FC<DocumentStatsProps> = ({ editor }) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const initDocumentStats = async () => {
      const showStats = await window.electronStore.getDocumentStats()
      setShow(showStats)
    }

    initDocumentStats()

    const handleDocStatsChange = (event: Electron.IpcRendererEvent, value: boolean) => {
      setShow(value)
    }

    window.ipcRenderer.on('show-doc-stats-changed', handleDocStatsChange)
  }, [])

  if (!editor || !show) return null

  return (
    <div className="absolute bottom-2 right-2 flex gap-4 text-sm text-gray-500">
      <div>Characters: {editor.storage.characterCount.characters()}</div>
      <div>Words: {editor.storage.characterCount.words()}</div>
    </div>
  )
}

export default DocumentStats
