import { Menu } from '@mantine/core'
import { createStyles } from '@mantine/styles'
import React, { ReactNode } from 'react'
import { Block, BlockNoteEditor, BlockSchema } from '@/lib/blocknote/core'

export type DragHandleMenuProps<BSchema extends BlockSchema> = {
  editor: BlockNoteEditor<BSchema>
  block: Block<BSchema>
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
