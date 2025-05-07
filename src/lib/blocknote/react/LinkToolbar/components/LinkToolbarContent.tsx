import { useState, useEffect } from "react"
import { BlockNoteEditor, BlockSchema } from "@/lib/blocknote/core"
import { LinkToolbarPositionerProps } from "../LinkToolbarPositioner"
import { Spinner, SizableText, YStack} from 'tamagui'
import { getUniqueSimilarFiles } from "@/lib/semanticService"
import { DBQueryResult } from "electron/main/vector-database/schema"
import { Stack, Text } from '@mantine/core'
import ThemedMenu, { ThemedDropdown, ThemedMenuItem } from "@/components/ui/ThemedMenu"

const LinkToolbarContent = <BSchema extends BlockSchema>(
  props: LinkToolbarPositionerProps<BSchema> & {
    editor: BlockNoteEditor<BSchema>
  }
) => {
  const [similarFiles, setSimilarFiles] = useState<DBQueryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [triggerRender, setTriggerRender] = useState(0)

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
        const files = await getUniqueSimilarFiles(props.editor.currentFilePath, 5)
        setSimilarFiles(files)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarFiles()
  }, [triggerRender])

  if (loading) {
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
        <Spinner size="small" color="$blue9" />
        <SizableText size="$2" textAlign="left" padding="$2">
          Loading similar files...
        </SizableText>
      </YStack>
    )
  }

  /**
   * Cannot use Menu or Popover because we have some async behavior.
   * When I tried to use an external library it would introduce many bugs
   */
  return (
    <ThemedMenu
      defaultOpened
      closeDelay={10000000}
      opened={true}
      closeOnClickOutside={true}
    >
      <ThemedDropdown onMouseDown={(e) => e.preventDefault()}>
        {
          similarFiles.slice(0, 5).map((file) => (
            <ThemedMenuItem
              onClick={() => props.editor.addLink(file.notepath, file.name)}
            >
              <Stack spacing={0}>
                <Text>{file.name}</Text>
                <Text size={10}>{file.notepath}</Text>
              </Stack>
            </ThemedMenuItem>
          ))
        }
      </ThemedDropdown>
    </ThemedMenu>
  )
}

export default LinkToolbarContent
