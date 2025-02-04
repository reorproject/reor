import { BlockSchema } from '@/editor/blocknote/core'

import { Link, XStack, useDocContentContext } from '@shm/ui'
import { DragHandleMenuProps } from '../DragHandleMenu'
import { DragHandleMenuItem } from '../DragHandleMenuItem'

export const CopyLinkToBlockButton = <BSchema extends BlockSchema>({ block }: DragHandleMenuProps<BSchema>) => {
  const { onCopyBlock } = useDocContentContext()
  if (!onCopyBlock) return null
  return (
    <DragHandleMenuItem
      onClick={() => {
        onCopyBlock(block.id)
      }}
    >
      <XStack gap="$2">
        <Link size={14} />
        Copy link to Block
      </XStack>
    </DragHandleMenuItem>
  )
}
