import React, { useEffect, useState } from 'react'

import { DBQueryResult } from 'electron/main/vector-database/schema'
import { toast } from 'react-toastify'
import '../../styles/global.css'
import posthog from 'posthog-js'
import { Stack } from 'tamagui'

import { getSimilarFiles } from '@/lib/semanticService'
import errorToStringRendererProcess from '@/lib/error'
import SimilarEntriesComponent from './SemanticSidebar/SimilarEntriesComponent'
import { useFileContext } from '@/contexts/FileContext'
import { useContentContext } from '@/contexts/ContentContext'

const SimilarFilesSidebarComponent: React.FC = () => {
  const [similarEntries, setSimilarEntries] = useState<DBQueryResult[]>([])
  const [isLoadingSimilarEntries, setIsLoadingSimilarEntries] = useState(false)

  const { currentlyOpenFilePath } = useFileContext()
  const { openContent: openTabContent } = useContentContext()

  const fetchSimilarEntries = async (path: string) => {
    try {
      setIsLoadingSimilarEntries(true)

      const searchResults = await getSimilarFiles(path)

      setSimilarEntries(searchResults ?? [])
    } catch (error) {
      toast.error(errorToStringRendererProcess(error), {
        className: 'mt-5',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      })
    } finally {
      setIsLoadingSimilarEntries(false)
    }
  }

  useEffect(() => {
    if (currentlyOpenFilePath) {
      fetchSimilarEntries(currentlyOpenFilePath)
    }
  }, [currentlyOpenFilePath])

  const updateSimilarEntries = async () => {
    if (!currentlyOpenFilePath) {
      toast.error('No file currently open.')
      return
    }

    await fetchSimilarEntries(currentlyOpenFilePath)
  }

  return (
    <Stack height="100%">
      <SimilarEntriesComponent
        similarEntries={similarEntries}
        setSimilarEntries={setSimilarEntries}
        onSelect={(path) => {
          openTabContent(path)
          posthog.capture('open_file_from_related_notes')
        }}
        updateSimilarEntries={updateSimilarEntries}
        isLoadingSimilarEntries={isLoadingSimilarEntries}
        titleText="Related notes"
      />
    </Stack>
  )
}

export default SimilarFilesSidebarComponent
