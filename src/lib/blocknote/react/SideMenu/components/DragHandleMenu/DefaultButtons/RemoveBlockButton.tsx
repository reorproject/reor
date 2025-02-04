import { BlockSchema } from '@/lib/blocknote/core'
import { ReactNode } from 'react'

import { Delete, XStack } from '@shm/ui'
import { DragHandleMenuProps } from '../DragHandleMenu'
import { DragHandleMenuItem } from '../DragHandleMenuItem'

export const RemoveBlockButton = <BSchema extends BlockSchema>(
  props: DragHandleMenuProps<BSchema> & { children: ReactNode },
) => {
  return (
    <DragHandleMenuItem onClick={() => props.editor.removeBlocks([props.block])}>
      <XStack gap="$2">
        <Delete size={14} />
        {props.children}
      </XStack>
    </DragHandleMenuItem>
  )
}
