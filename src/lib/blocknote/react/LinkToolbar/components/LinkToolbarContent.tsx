import { BlockNoteEditor, BlockSchema } from "@/lib/blocknote/core"
import { LinkToolbarPositionerProps } from "../LinkToolbarPositioner"
import { getCachedSimilarFiles } from "@/lib/semanticService"
import { SizableText, YStack, XStack } from 'tamagui'

const LinkToolbarContent = <BSchema extends BlockSchema>(
  props: LinkToolbarPositionerProps<BSchema> & {
    editor: BlockNoteEditor<BSchema>
  },
) => {

  const similarFiles = getCachedSimilarFiles(props.editor.getCurrentFilePath())
  const size = similarFiles.length <= 5 ? similarFiles.length : 5
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
      {similarFiles.slice(0, size).map((file) => (
        <XStack
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
          <SizableText
            size="$2"
            textAlign="left"
            padding="$2">
              {file.name}
          </SizableText>
        </XStack>
      ))}
    </YStack>
  )
}

export default LinkToolbarContent