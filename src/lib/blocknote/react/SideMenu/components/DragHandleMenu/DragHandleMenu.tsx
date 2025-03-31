import { Menu } from '@mantine/core'
import { createStyles } from '@mantine/styles'
import React, { ReactNode } from 'react'
import { Block, BlockNoteEditor } from '@/lib/blocknote/core'
import { HMBlockSchema } from '@/components/Editor/schema'

export type DragHandleMenuProps<BSchema extends HMBlockSchema> = {
  block: Block<BSchema>
  editor: BlockNoteEditor<BSchema>
}

export const DragHandleMenu = (props: { children: ReactNode }) => {
  const { classes } = createStyles({
    root: {
      minWidth: 180,
    },
  })(undefined, {
    name: 'DragHandleMenu',
  })

  return <Menu.Dropdown className={classes.root}>{props.children}</Menu.Dropdown>
}
