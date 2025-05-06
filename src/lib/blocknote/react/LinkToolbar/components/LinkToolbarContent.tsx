import { useState, useEffect } from "react"
import { BlockNoteEditor, BlockSchema } from "@/lib/blocknote/core"
import { LinkToolbarPositionerProps } from "../LinkToolbarPositioner"
import { Spinner, SizableText, YStack, XStack } from 'tamagui'
import { getSimilarFiles } from "@/lib/semanticService"
import { DBQueryResult } from "electron/main/vector-database/schema"

const LinkToolbarContent = <BSchema extends BlockSchema>(
  props: LinkToolbarPositionerProps<BSchema> & {
    editor: BlockNoteEditor<BSchema>
  }
) => {
  const [similarFiles, setSimilarFiles] = useState<DBQueryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [triggerRender, setTriggerRender] = useState(0)

  // DEBOUNCE THIS
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTriggerRender((prev) => prev + 1)
    }, 100)
  
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const fetchSimilarFiles = async () => {
      if (!props.editor.currentFilePath) return
      try {
        const files = await getSimilarFiles(props.editor.currentFilePath, 5)
        setSimilarFiles(files)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarFiles()
  }, [triggerRender])

  if (loading) {
    return (
      <XStack
        background="$gray2"
        padding="$2"
        gap="$1"
        borderRadius="$2"
        borderWidth={1}
        borderColor="$gray6"
        elevation="$2"
      >
        <Spinner size="small" color="$blue9" />
        <SizableText size="$2" textAlign="left" padding="$2">
          Loading similar files...
        </SizableText>
      </XStack>
    )
  }

  return (
    <YStack
      background="$gray2"
      padding="$2"
      gap="$1"
      borderRadius="$2"
      borderWidth={1}
      borderColor="$gray6"
      elevation="$2"
    >
      {similarFiles.slice(0, 5).map((file) => (
        <XStack
          key={file.notepath}
          cursor="pointer"
          hoverStyle={{
            backgroundColor: '$gray3',
            borderRadius: '$2',
          }}
          padding="$1"
          onPress={() => {
            props.editor.addLink(file.notepath, file.name)
          }}
        >
          <SizableText size="$2" textAlign="left" padding="$2">
            {file.name}
          </SizableText>
        </XStack>
      ))}
    </YStack>
  )
}

export default LinkToolbarContent
